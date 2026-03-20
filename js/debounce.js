export function debounce(func, delay = 300) {
    let timeoutID;
    return function (...args) {
        clearTimeout(timeoutID)
        timeoutID = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export async function loadJSONData(url) {
    const base = "./data/"
    try {
        const r = await fetch(base + url + ".json");
    } catch (e) {
        throw new Error('No se pudo conectar al servidor. Abre el proyecto con: npx serve . (no con file://)');
    }
    if (!r.ok) throw new Error('No se pudo cargar ' + url + '.json');
    return r.json();
}