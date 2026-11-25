
(() => {
    "use strict";

    const exercises = {
        "goblet squat": "squat",
        "leg press": "legpress",
        "reverse lunge": "lunge",
        "glute bridge": "bridge",
        "hip thrust": "hipthrust",
        "seated cable row": "row",
        "lat pulldown": "pulldown",
        "incline push-up": "pushup",
        "chest press": "chestpress",
        "shoulder press": "shoulder",
        "biceps curl": "curl",
        "triceps pushdown": "triceps",
        "plank": "plank",
        "dead bug": "deadbug"
    };

    const normalize = value =>
        value.trim().toLowerCase().replace(/\s+/g, " ");

    function syncTheme() {
        const root = document.documentElement;
        const body = document.body;

        if (!body) return;

        const theme =
            root.getAttribute("data-theme") ||
            body.getAttribute("data-theme") || "";

        const classes =
            root.className + " " + body.className;

        let dark;

        if (body.classList.contains("light-theme")) {
            dark = false;
        } else if (body.classList.contains("workspace") || body.classList.contains("landing-page")) {
            dark = true;
        } else if (/dark/i.test(theme)) {
            dark = true;
        } else if (/light/i.test(theme)) {
            dark = false;
        } else if (/dark/i.test(classes)) {
            dark = true;
        } else if (/light/i.test(classes)) {
            dark = false;
        } else {
            const bg = getComputedStyle(body).backgroundColor;
            const rgb = bg.match(/[\d.]+/g);

            dark = rgb && rgb.length >= 3
                ? Number(rgb[0]) * .299 +
                  Number(rgb[1]) * .587 +
                  Number(rgb[2]) * .114 < 128
                : false;
        }

        const next = dark ? "dark" : "light";

        if (root.dataset.fpTheme !== next) {
            root.dataset.fpTheme = next;
        }
    }

    function findExercise(control) {
        let parent = control.parentElement;

        for (let i = 0; parent && i < 6; i++) {
            const headings = parent.querySelectorAll(
                "h2, h3, h4, [data-exercise-name]"
            );

            const matches = [...headings]
                .map(h => normalize(
                    h.dataset.exerciseName || h.textContent
                ))
                .filter(name => exercises[name]);

            const unique = [...new Set(matches)];

            if (unique.length === 1) {
                return unique[0];
            }

            if (unique.length > 1) break;

            parent = parent.parentElement;
        }

        return null;
    }

    function improveCharts() {
        if (!location.pathname.includes("progress")) return;

        document.querySelectorAll("#progressChart")
            .forEach(svg => {
                if (
                    svg.querySelector("text") &&
                    svg.querySelector("line, polyline, circle")
                ) {
                    svg.classList.add("fp-progress-chart");
                }
            });
    }

    function refresh() {
        syncTheme();
        improveCharts();
    }

    function start() {
        refresh();

        let pending = false;

        const observer = new MutationObserver(() => {
            if (pending) return;
            pending = true;

            requestAnimationFrame(() => {
                pending = false;
                refresh();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "data-theme"]
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme"]
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
