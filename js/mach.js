/**
 * mach.js — Calculadora de Número Mach
 */

function toggleMachCalc() {
  document.getElementById('machCalc')?.classList.toggle('open');
}

function updateAltLabel() {
  const alt = parseInt(document.getElementById('altSlider')?.value || 0);
  const el  = document.getElementById('altLabel');
  if (el) el.textContent = alt === 0 ? '0 m (nivel del mar)' : `${alt.toLocaleString('es-ES')} m`;
}

function calcMach() {
  const rawVal = parseFloat(document.getElementById('machSpeedInput')?.value);
  const unit   = document.getElementById('machUnit')?.value || 'kmh';
  const alt    = parseInt(document.getElementById('altSlider')?.value || 0);
  const resEl  = document.getElementById('machResult');
  const catEl  = document.getElementById('machCategory');
  if (!resEl || !catEl) return;

  if (!rawVal || rawVal <= 0) {
    resEl.textContent  = '—';
    resEl.className    = 'mach-result header-font';
    catEl.textContent  = 'Introduce una velocidad';
    catEl.className    = 'mach-category';
    return;
  }

  let kmh = rawVal;
  if (unit === 'knots') kmh = rawVal * 1.852;
  if (unit === 'mph')   kmh = rawVal * 1.60934;

  const mach = kmh / speedOfSound(alt);
  resEl.textContent = `M ${mach.toFixed(3)}`;

  let label = '', cls = '';
  if      (mach < 0.8)  { label = 'SUBSÓNICO';        cls = 'subsonic';     }
  else if (mach < 1.2)  { label = 'TRANSSÓNICO';      cls = 'transonic';    }
  else if (mach < 5)    { label = 'SUPERSÓNICO';      cls = 'supersonic';   }
  else if (mach < 10)   { label = 'HIPERSÓNICO';      cls = 'hypersonic';   }
  else                  { label = 'ALTA HIPERSONÍA';  cls = 'highersonic';  }

  catEl.textContent = label;
  catEl.className   = `mach-category ${cls}`;
  resEl.className   = `mach-result header-font ${cls}`;
}
