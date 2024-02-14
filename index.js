"use strict";

const defaultOptions = {
  reverse: false,
  python: false  
};

function mergeSequences(inputSequences) {
  const result = [];
  const sequencesCopy = inputSequences.map(seq => seq.slice());
  
  while (sequencesCopy.length > 0) {
    let found = false;
    let currentHead;
  
    for (let seq of sequencesCopy) {
      currentHead = seq[0];
    
      if (!seqContainsHead(seq, currentHead)) {
        found = true;
        result.push(currentHead);
      
        removeHeadFromSequences(sequencesCopy, currentHead);
        break;
      }
    }
  
    sequencesCopy = filterRemainingSequences(sequencesCopy);
  
    if (!found) {
      throw new Error("Cannot find C3 linearization for input");
    }
  }

  return result;
}

function seqContainsHead(seq, head) {
  return seq !== head && seq.slice(1).includes(head);
}

function removeHeadFromSequences(sequences, head) {
  for (let seq of sequences) {
    const index = seq.indexOf(head);
    if (index > -1) {
      seq.splice(index, 1);
    }
  }
}

function filterRemainingSequences(sequences) {
  return sequences.filter(seq => seq.length > 0);
}

function topologicalSort(graph, head, results, visiting, options) {
  if (results.hasOwnProperty(head)) {
    return results[head];
  }

  if (visiting.has(head)) {
    throw new Error("Circular dependency found");
  }

  visiting.add(head);

  let parents = graph[head];

  if (!parents || parents.length === 0) {
    const res = [head];
    results[head] = res;
    return res;
  }

  if (options.reverse === true) {
    parents = parents.slice().reverse();
  }

  const parentSequences = mapParentSequences(graph, parents, visiting, options);

  if (options.python === true) {
    parentSequences.push(parents);
  }

  const res = [head].concat(mergeSequences(parentSequences));
  results[head] = res;

  visiting.delete(head);

  return res;
}

function mapParentSequences(graph, parents, visiting, options) {
  return parents.map(parent => {
    return topologicalSort(graph, parent, {}, visiting, options); 
  });
}

function linearize(graph, options) {
  options = Object.assign({}, defaultOptions, options);

  const results = {};
  const visiting = new Set();
  const heads = Object.keys(graph);

  for (let head of heads) {
    topologicalSort(graph, head, results, visiting, options);
  }

  return results;
}

module.exports.linearize = linearize;
