const parse = line => {
  let dest, comp, jump, includesComp;

  // line includes '=', so dest and comp are defined
  if (line.includes('=')) {
    [dest, includesComp] = line.split('=');
    [comp] = includesComp.split(';');
  }

  // line includes ';', so comp and jump are defined
  if (line.includes(';')) {
    [includesComp, jump] = line.split(';');
    const splitIncludesComp = includesComp.split('=');
    comp = splitIncludesComp[splitIncludesComp.length - 1];
  }

  return { dest, comp, jump };
};

module.exports = parse;
