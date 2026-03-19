/**
 * pwa.js — Progressive Web App: Service Worker + banner de instalación
 */

let deferredInstallPrompt = null;
let swRegistration        = null;

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js', { scope: './' })
    .then(reg => {
      swRegistration = reg;
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW?.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            showPWAUpdateToast();
          }
        });
      });
      if (reg.waiting) showPWAUpdateToast();
    })
    .catch(err => console.warn('[PWA] Error SW:', err));

  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}

function initInstallBanner() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  const dismissed = localStorage.getItem(PWA_DISMISSED_KEY);
  if (dismissed && Date.now() - parseInt(dismissed) < 7 * 86400000) return;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    setTimeout(showPWAInstallBanner, 3000);
  });

  window.addEventListener('appinstalled', () => {
    hidePWAInstallBanner();
    deferredInstallPrompt = null;
  });
}

function showPWAInstallBanner() {
  const banner = document.getElementById('pwaInstallBanner');
  if (!banner) return;
  banner.classList.remove('hidden');
  requestAnimationFrame(() => banner.classList.add('visible'));
  document.getElementById('pwaInstallBtn')?.addEventListener('click', triggerInstall);
  document.getElementById('pwaDismissBtn')?.addEventListener('click', dismissInstallBanner);
}

function hidePWAInstallBanner() {
  const banner = document.getElementById('pwaInstallBanner');
  if (!banner) return;
  banner.classList.remove('visible');
  setTimeout(() => banner.classList.add('hidden'), 400);
}

async function triggerInstall() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  console.log('[PWA] Instalación:', outcome);
  deferredInstallPrompt = null;
  hidePWAInstallBanner();
}

function dismissInstallBanner() {
  localStorage.setItem(PWA_DISMISSED_KEY, String(Date.now()));
  hidePWAInstallBanner();
}

function showPWAUpdateToast() {
  const toast = document.getElementById('pwaUpdateToast');
  if (!toast) return;
  toast.classList.remove('hidden');
  requestAnimationFrame(() => toast.classList.add('visible'));
}

function applyPWAUpdate() {
  swRegistration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}
