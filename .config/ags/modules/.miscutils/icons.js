const { Gtk } = imports.gi;
let opts = await userOptions.asyncGet()


export function iconExists(iconName) {
    let iconTheme = Gtk.IconTheme.get_default();
    return iconTheme.has_icon(iconName);
}

export function substitute(str) {
    // Normal substitutions
    if (opts.icons.substitutions[str])
        return opts.icons.substitutions[str];

    // Regex substitutions
    for (let i = 0; i < opts.icons.regexSubstitutions.length; i++) {
        const substitution = opts.icons.regexSubstitutions[i];
        const replacedName = str.replace(
            substitution.regex,
            substitution.replace,
        );
        if (replacedName != str) return replacedName;
    }

    // Guess: convert to kebab case
    if (!iconExists(str)) str = str.toLowerCase().replace(/\s+/g, "-");

    // Original string
    return str;
}
