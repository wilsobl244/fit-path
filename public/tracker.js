
const plan = ensurePlan();

if (plan) {
    const daySelect = document.getElementById("daySelect");
    const dateInput = document.getElementById("workoutDate");
    const list = document.getElementById("workoutList");
    const status = document.getElementById("status");

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());

    dateInput.value = today.toISOString().slice(0, 10);
    dateInput.max = dateInput.value;

    plan.days.forEach(day => {
        daySelect.add(new Option(day, day));
    });

    const requested = new URLSearchParams(location.search).get("day");

    if (plan.days.includes(requested)) {
        daySelect.value = requested;
    }

    function logs() {
        try {
            const data = JSON.parse(
                localStorage.getItem("fitpathLogs") || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function persist(entries) {
        localStorage.setItem(
            "fitpathLogs",
            JSON.stringify(entries)
        );
    }

    function element(tag, className, text) {
        const el = document.createElement(tag);

        if (className) el.className = className;
        if (text !== undefined) el.textContent = text;

        return el;
    }

    function updateSession() {
        const current = logs().filter(entry =>
            entry.date === dateInput.value &&
            entry.day === daySelect.value
        );

        const count = document.getElementById("sessionCount");
        const hint = document.getElementById("sessionHint");

        if (count) {
            count.textContent =
                current.length + " sets logged";
        }

        if (hint) {
            hint.textContent = current.length
                ? "Your completed sets are saved on this device."
                : "Complete your sets, then log each exercise.";
        }
    }

    let dirtyCards = new Set();

    function render() {
        list.replaceChildren();
        dirtyCards.clear();
        updateSession();

        const day = daySelect.value;
        const date = dateInput.value;

        if (!date || date > dateInput.max) {
            status.textContent = "Choose a valid workout date.";
            return;
        }

        const ids = plan.exercises[day] || [];

        if (!ids.length) {
            const message = element(
                "p",
                "empty-state",
                "No exercises scheduled for this day."
            );

            const link = element(
                "a",
                "primary-button",
                "Choose exercises"
            );

            link.href =
                "exercises.html?day=" + encodeURIComponent(day);

            list.append(message, link);
            return;
        }

        const session = plan.sessions?.[day] || {};
        const level = plan.experience || "Beginner";

        const defaultSets =
            level === "Beginner" ? 2 :
            level === "Advanced" ? 4 : 3;

        const targetSets =
            Number.isInteger(session.sets) &&
            session.sets >= 1 &&
            session.sets <= 5
                ? session.sets
                : defaultSets;

        const targetReps =
            typeof session.reps === "string" &&
            session.reps.length < 25
                ? session.reps
                : "8–12";

        const suggestedReps =
            Number(targetReps.match(/\d+/)?.[0]) || 8;

        const guide = document.getElementById("workoutGuide");

        if (guide) {
            guide.querySelector("h2").textContent =
                session.focus || "Your workout";

            guide.querySelector("p").textContent =
                ids.length + " exercises · " +
                targetSets + " suggested sets · " +
                targetReps + " reps · " + level;
        }

        ids.forEach(id => {
            const ex = EXERCISES.find(e => e.id === id);

            if (!ex) return;

            const card = element("section", "log-card");

            const title = element("h2", "", ex.name);

            const meta = element(
                "p",
                "exercise-meta",
                ex.group + " · " + ex.equipment
            );

            const recommendation = element(
                "div",
                "set-recommendation"
            );

            recommendation.append(
                element(
                    "strong",
                    "",
                    "Suggested: " + targetSets +
                    " sets × " + targetReps + " reps"
                ),
                element(
                    "span",
                    "",
                    "Use controlled movement and a manageable weight. Adjust your sets and repetitions as needed."
                )
            );

            const previous = logs()
                .filter(e =>
                    e.exerciseId === id && e.date < date
                )
                .sort((a, b) =>
                    b.date.localeCompare(a.date)
                );

            if (previous.length) {
                recommendation.append(
                    element(
                        "small",
                        "",
                        "Last logged: " +
                        previous[0].weight + " lb × " +
                        previous[0].reps + " reps"
                    )
                );
            }

            let prior = logs().filter(e =>
                e.date === date &&
                e.day === day &&
                e.exerciseId === id
            );

            const progress = element(
                "div",
                "fp-log-progress"
            );

            const progressHeader = element(
                "div",
                "fp-log-progress-header"
            );

            const progressText = element("span", "", "");

            progressHeader.append(
                element("strong", "", "Exercise progress"),
                progressText
            );

            const track = element(
                "div",
                "fp-log-progress-track"
            );

            const fill = element(
                "div",
                "fp-log-progress-fill"
            );

            track.append(fill);
            progress.append(progressHeader, track);

            const table = element("div", "set-table");
            const head = element("div", "set-row set-heading");

            head.innerHTML =
                "<span>Set</span>" +
                "<span>Weight (lb)</span>" +
                "<span>Reps</span>" +
                "<span>Done</span>";

            table.append(head);

            const rows = [];

            const message = element("div", "fp-log-message");
            message.setAttribute("role", "status");
            message.setAttribute("aria-live", "polite");

            const save = element(
                "button",
                "primary-button fp-log-save"
            );

            save.type = "button";

        let undoSnapshot = null;

        const undo = element(
            "button",
            "fp-undo-log",
            "Undo logging"
        );

        undo.type = "button";
        undo.hidden = true;

        undo.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" stroke-linejoin="round" ' +
            'aria-hidden="true">' +
            '<path d="M9 14 4 9l5-5"/>' +
            '<path d="M4 9h10a6 6 0 0 1 0 12h-2"/>' +
            '</svg><span>Undo logging</span>';

        undo.addEventListener("click", () => {
            if (undoSnapshot === null) return;

            const current = logs().filter(e =>
                !(e.date === date &&
                  e.day === day &&
                  e.exerciseId === id)
            );

            try {
                persist([
                    ...current,
                    ...undoSnapshot
                ]);
            } catch {
                showMessage(
                    "Unable to undo logging. Please try again.",
                    "is-error"
                );
                return;
            }

            undoSnapshot = null;
            undo.hidden = true;

            prior = logs().filter(e => e.date === date && e.day === day && e.exerciseId === id);
            rows.forEach(r => {
                const old = prior.find(e => e.set === r.n);
                r.done.checked = Boolean(old);
                r.weight.value = old?.weight ?? "";
                r.reps.value = old?.reps ?? "";
                r.weight.disabled = r.done.checked;
                r.reps.disabled = r.done.checked;
                r.row.classList.toggle("completed", r.done.checked);
            });
            dirtyCards.delete(card);
            save.classList.remove("is-saved");
            save.innerHTML = checkIcon + (prior.length ? "Update exercise" : "Log exercise");

            showMessage(
                "Logging undone. Your previous saved history has been restored. You can edit your sets and log again.",
                "is-success"
            );

            updateSession();
            refreshProgress();
            save.focus();
        });

            const checkIcon =
                '<svg viewBox="0 0 24 24" fill="none" ' +
                'stroke="currentColor" stroke-width="2" ' +
                'stroke-linecap="round" stroke-linejoin="round" ' +
                'aria-hidden="true">' +
                '<path d="m5 12 4 4L19 6"/></svg>';

            function showMessage(text, type) {
                message.className =
                    "fp-log-message " + type;

                message.textContent = text;
            }

            function refreshProgress() {
                const completed = rows.filter(
                    r => r.done.checked
                ).length;

                progressText.textContent =
                    completed + " of " + rows.length + " sets";

                fill.style.width =
                    (rows.length
                        ? completed / rows.length * 100
                        : 0) + "%";
            }

            function markDirty() {
                dirtyCards.add(card);
                save.innerHTML = checkIcon + "Log exercise";
                save.classList.remove("is-saved");

                message.textContent = "";
                message.className = "fp-log-message";

                refreshProgress();
            }

            function valid(row) {
                const w = Number(row.weight.value);
                const r = Number(row.reps.value);

                return (
                    row.weight.value.trim() !== "" &&
                    row.reps.value.trim() !== "" &&
                    Number.isFinite(w) &&
                    w >= 0 && w <= 2000 &&
                    Number.isInteger(r) &&
                    r >= 1 && r <= 1000
                );
            }

            function addRow(n) {
                const saved = prior.find(e => e.set === n);

                const row = element("div", "set-row");
                const number = element("span", "", String(n));

                const weight = document.createElement("input");

                weight.type = "number";
                weight.min = "0";
                weight.max = "2000";
                weight.step = "any";
                weight.inputMode = "decimal";
                weight.placeholder = "e.g. 0";

                weight.value = saved?.weight ?? "";

                weight.setAttribute(
                    "aria-label",
                    ex.name + " set " + n + " weight in pounds"
                );

                const reps = document.createElement("input");

                reps.type = "number";
                reps.min = "1";
                reps.max = "1000";
                reps.step = "1";
                reps.inputMode = "numeric";
                reps.value = saved?.reps ?? "";
                reps.placeholder = String(suggestedReps);

                reps.setAttribute(
                    "aria-label",
                    ex.name + " set " + n + " repetitions"
                );

                const done = document.createElement("input");

                done.type = "checkbox";
                done.className = "fp-done-checkbox";
                done.checked = Boolean(saved);

                done.setAttribute(
                    "aria-label",
                    "Complete " + ex.name + " set " + n
                );

                const entry = {
                    n, row, weight, reps, done
                };

                rows.push(entry);

                function sync() {
                    row.classList.toggle(
                        "completed",
                        done.checked
                    );

                    weight.disabled = done.checked;
                    reps.disabled = done.checked;
                }

                done.addEventListener("change", () => {
                    if (done.checked && !valid(entry)) {
                        done.checked = false;

                        showMessage(
                            "Set " + n + ": enter weight (0 for bodyweight, up to 2000 lb) and whole repetitions (1–1000), then check Done.",
                            "is-error"
                        );

                        if (weight.value.trim() === "") {
                            weight.focus();
                        } else if (
                            !Number.isFinite(Number(weight.value)) ||
                            Number(weight.value) < 0 ||
                            Number(weight.value) > 2000
                        ) {
                            weight.focus();
                        } else {
                            reps.focus();
                        }

                        return;
                    }

                    sync();
                    markDirty();
                });

                for (const field of [weight, reps]) {
                    field.addEventListener("input", () => {
                        field.removeAttribute("aria-invalid");
                        markDirty();
                    });
                    field.addEventListener("blur", () => {
                        if (field.value !== "" && !field.validity.valid) {
                            field.setAttribute("aria-invalid", "true");
                            showMessage("Set " + n + ": " + (field === weight ? "Weight must be 0–2000 lb." : "Reps must be a whole number from 1 to 1000."), "is-error");
                        }
                    });
                }

                sync();

                row.append(number, weight, reps, done);
                table.append(row);

                refreshProgress();
            }

            const count = Math.max(
                targetSets,
                prior.reduce(
                    (max, e) => Math.max(max, e.set),
                    0
                )
            );

            for (let n = 1; n <= count; n++) {
                addRow(n);
            }

            const actions = element("div", "fp-log-actions");

            const more = element(
                "button",
                "secondary-button fp-add-set",
                "+ Add set"
            );

            more.type = "button";

            more.addEventListener("click", () => {
                addRow(rows.length + 1);
                markDirty();
            });

            save.innerHTML = checkIcon + "Log exercise";

            if (prior.length) {
                save.innerHTML = checkIcon + "Update exercise";

                showMessage(
                    prior.length + " sets previously saved.",
                    "is-success"
                );
            }

            save.addEventListener("click", () => {
                const completed = rows.filter(
                    r => r.done.checked
                );

                if (!completed.length) {
                    showMessage("Nothing to log yet. Enter weight (0 for bodyweight) and reps, then check Done for at least one set. Your saved history has not changed.", "is-error");
                    const first = rows[0];
                    if (first) (first.weight.value === "" ? first.weight : first.reps.value === "" ? first.reps : first.done).focus();
                    return;
                }
                const unfinished = rows.find(r => !r.done.checked && (r.weight.value !== "" || r.reps.value !== "") && !prior.some(e => e.set === r.n));
                if (unfinished) {
                    showMessage("Set " + unfinished.n + " has unsaved input. Complete both fields and check Done, or clear the fields before logging.", "is-error");
                    (unfinished.weight.value === "" ? unfinished.weight : unfinished.reps.value === "" ? unfinished.reps : unfinished.done).focus();
                    return;
                }

                if (completed.some(r => !valid(r))) {
                    showMessage(
                        "Check your weight and repetitions.",
                        "is-error"
                    );
                    return;
                }

                const existing = logs();

        const previousSnapshot = existing.filter(e =>
            e.date === date &&
            e.day === day &&
            e.exerciseId === id
        );

                const entries = existing.filter(e =>
                    !(
                        e.date === date &&
                        e.day === day &&
                        e.exerciseId === id
                    )
                );

                completed.forEach(r => {
                    entries.push({
                        date,
                        day,
                        exerciseId: id,
                        set: r.n,
                        weight: Number(r.weight.value),
                        reps: Number(r.reps.value)
                    });
                });

                try {
                    persist(entries);
                } catch {
                    showMessage(
                        "Could not save. Check browser storage settings and try again.",
                        "is-error"
                    );
                    return;
                }

                prior = entries.filter(e => e.date === date && e.day === day && e.exerciseId === id);
                undoSnapshot = previousSnapshot;
        undo.hidden = false;

        dirtyCards.delete(card);

                save.classList.add("is-saved");

                save.innerHTML = checkIcon +
                    (completed.length
                        ? "Exercise logged"
                        : "Exercise updated");

                showMessage(
                    completed.length
                        ? "Exercise successfully logged! " +
                          completed.length +
                          " completed sets saved to your workout history."
                        : "Saved sets removed successfully.",
                    "is-success"
                );

                updateSession();
                refreshProgress();
            });

            const saveGroup = element("div", "fp-log-save-group");
            saveGroup.append(undo, save);
            actions.append(more, saveGroup);

            card.append(
                title,
                meta,
                recommendation,
                exerciseGuideButton(ex),
                progress,
                element("p", "fp-log-instructions", "Enter your actual weight and reps for each set. Use 0 lb for bodyweight. Check Done, then select Log exercise."),
                table,
                actions,
                message
            );

            list.append(card);
        });
    }

    let activeDay = daySelect.value;
    let activeDate = dateInput.value;

    function changeSession() {
        if (
            dirtyCards.size &&
            !window.confirm(
                "You have unsaved exercise changes. Discard them?"
            )
        ) {
            daySelect.value = activeDay;
            dateInput.value = activeDate;
            return;
        }

        activeDay = daySelect.value;
        activeDate = dateInput.value;

        status.textContent = "";
        render();
    }

    daySelect.addEventListener("change", changeSession);
    dateInput.addEventListener("change", changeSession);

    window.addEventListener("beforeunload", event => {
        if (!dirtyCards.size) return;

        event.preventDefault();
        event.returnValue = "";
    });

    render();
}
