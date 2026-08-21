import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

// Clasificación heurística por User-Agent — best-effort, nunca un hecho
// verificado. Los navegadores modernos generalizan cada vez más el UA por
// privacidad (User-Agent reduction / Client Hints en Chromium), así que esto
// será cada vez menos granular con el tiempo.
export const parseUserAgent = (uaString) => {
    if (!uaString) {
        return { deviceType: 'unknown', operatingSystem: null, browser: null };
    }

    const { device, os, browser } = UAParser(uaString);

    let deviceType = 'desktop'; // ua-parser-js no marca "desktop" explícitamente; es el caso por defecto
    if (device.type === 'mobile') deviceType = 'mobile';
    else if (device.type === 'tablet') deviceType = 'tablet';
    else if (device.type) deviceType = 'other'; // console, smarttv, wearable, embedded...

    return {
        deviceType,
        operatingSystem: os.name ? `${os.name}${os.version ? ' ' + os.version : ''}`.trim() : null,
        browser: browser.name ? `${browser.name}${browser.version ? ' ' + browser.version : ''}`.trim() : null,
    };
};

// Geolocalización aproximada por IP (dataset local, sin llamadas a terceros).
// Limitaciones importantes: con VPN, proxy corporativo o CGNAT del propio
// visitante, esto resuelve la ubicación del nodo de salida, no la real. IPs
// privadas/locales (desarrollo) no resuelven nada.
export const lookupGeo = (ip) => {
    if (!ip) return { country: null, region: null, city: null };
    const geo = geoip.lookup(ip);
    if (!geo) return { country: null, region: null, city: null };
    return {
        country: geo.country || null,
        region: geo.region || null,
        city: geo.city || null,
    };
};
