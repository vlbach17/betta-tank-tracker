// Dev loader: fetches .jsx sources, transpiles with Babel standalone, exposes them on window.Bettabase.
// Consumers with the compiled _ds_bundle.js can skip this. Usage: await loadBettabase('../components/core/')
window.loadJsx = async function (base, names, ns) {
  for (const name of names) {
    let src = await (await fetch(base + name + '.jsx')).text();
    src = src.replace(/import[\s\S]*?from\s*["'][^"']+["'];?/g, '').replace(/export (const|function) /g, '$1 ');
    const exportsList = [...src.matchAll(/^(?:const|function) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    const code = Babel.transform('(function(){' + src + '\n;return {' + exportsList.join(',') + '};})', { presets: [['react', { runtime: 'classic' }]] }).code;
    const scope = { React, Fragment: React.Fragment, useState: React.useState, useMemo: React.useMemo, useEffect: React.useEffect, useRef: React.useRef, useCallback: React.useCallback, useReducer: React.useReducer, useId: React.useId, ...ns };
    const fn = new Function(...Object.keys(scope), 'return ' + code.replace(/;\s*$/, ''));
    Object.assign(ns, fn(...Object.values(scope))());
  }
  return ns;
};
window.loadBettabase = function (base) {
  const ns = (window.Bettabase = window.Bettabase || {});
  return loadJsx(base, ['Icon', 'Button', 'IconButton', 'Input', 'StatusPill', 'StatusDot', 'RangeToggle', 'NavChips', 'BackLink', 'Avatar', 'Sparkline', 'ParameterTile', 'RangeField'], ns);
};
