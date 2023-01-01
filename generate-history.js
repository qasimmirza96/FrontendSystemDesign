#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);

function getArg(name, defaultValue) {
    const index = args.indexOf(`--${name}`);
    if (index !== -1 && args[index + 1]) {
        return args[index + 1];
    }
    return defaultValue;
}

const YEAR = parseInt(getArg("year", "2023"));

const MIN_COMMITS = parseInt(getArg("min", "2"));
const MAX_COMMITS = parseInt(getArg("max", "2"));

const FILE = path.join(__dirname, "history.json");

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTime(date) {
    const hour = random(8, 22);
    const minute = random(0, 59);
    const second = random(0, 59);

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
        second
    );
}

let commitsCreated = 0;

for (
    let current = new Date(YEAR, 0, 1);
    current.getFullYear() === YEAR;
    current.setDate(current.getDate() + 1)
) {

    const commitsToday = random(MIN_COMMITS, MAX_COMMITS);

    for (let i = 0; i < commitsToday; i++) {

        const commitDate = randomTime(current);

        const data = {
            commit: commitsCreated + 1,
            date: commitDate.toISOString(),
            random: Math.random()
        };

        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

        execSync("git add .");

        execSync(`git commit -m "Daily Update"`, {
            env: {
                ...process.env,
                GIT_AUTHOR_DATE: commitDate.toISOString(),
                GIT_COMMITTER_DATE: commitDate.toISOString(),
            },
            stdio: "ignore"
        });

        commitsCreated++;
    }
}

console.log(`Finished!`);
console.log(`Year: ${YEAR}`);
console.log(`Total commits: ${commitsCreated}`);