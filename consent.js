// Cookie banner and Meta pixel. Nothing is sent to Meta before "Aceptar".
(() => {
  const META_PIXEL_ID = ''; // Meta pixel id; empty = no pixel even with consent
  const COOKIE = 'erizo_consent';
  const MAX_AGE = 15552000; // 6 months

  const onErizo = /(^|\.)erizoai\.com$/.test(location.hostname);
  const secure = location.protocol === 'https:';

  const attrs = (maxAge) =>
    `; Path=/${onErizo ? '; Domain=.erizoai.com' : ''}; Max-Age=${maxAge}${secure ? '; Secure' : ''}; SameSite=Lax`;

  const readConsent = () => {
    const m = document.cookie.match(/(?:^|;\s*)erizo_consent=([^;]*)/);
    return m && (m[1] === 'granted' || m[1] === 'denied') ? m[1] : null;
  };

  const deleteMetaCookies = () => {
    ['_fbp', '_fbc'].forEach((name) => {
      document.cookie = `${name}=${attrs(0)}`;
      // also the host-only variant, in case it was set without a domain
      document.cookie = `${name}=; Path=/; Max-Age=0${secure ? '; Secure' : ''}; SameSite=Lax`;
    });
  };

  let pixelLoaded = false;
  let revoked = false;

  const loadPixel = () => {
    if (pixelLoaded || !META_PIXEL_ID) return;
    pixelLoaded = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  };

  window.erizoTrack = (name) => {
    if (pixelLoaded && !revoked && typeof window.fbq === 'function') window.fbq('track', name);
  };

  const applyConsent = (value) => {
    if (value === 'granted') {
      revoked = false;
      loadPixel();
    } else {
      revoked = true;
      if (pixelLoaded && typeof window.fbq === 'function') window.fbq('consent', 'revoke');
      deleteMetaCookies();
    }
  };

  let banner = null;
  const hideBanner = () => { if (banner) banner.hidden = true; };

  const choose = (value) => {
    document.cookie = `${COOKIE}=${value}${attrs(MAX_AGE)}`;
    applyConsent(value);
    hideBanner();
  };

  const showBanner = () => {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookies');
      banner.innerHTML =
        '<p>Usamos cookies de Meta para medir nuestros anuncios, solo si los aceptas. ' +
        '<a href="cookies.html">Política de cookies</a></p>' +
        '<div class="consent-actions">' +
        '<button type="button" class="btn btn-sm" data-consent="denied">Rechazar</button>' +
        '<button type="button" class="btn btn-sm" data-consent="granted">Aceptar</button>' +
        '</div>';
      banner.querySelectorAll('[data-consent]').forEach((b) =>
        b.addEventListener('click', () => choose(b.dataset.consent)));
      document.body.appendChild(banner);
    }
    banner.hidden = false;
  };

  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (t) {
      e.preventDefault();
      showBanner();
    }
  });

  const current = readConsent();
  if (current === null) showBanner();
  else applyConsent(current);
})();
