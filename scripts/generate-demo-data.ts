import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import {
  Department,
  Departments,
  Positions,
  Spacefarers,
} from "../@cds-models/SpacefarerService";

interface ManagedDepartment extends Department {
  planet: string;
}

const NAMESPACE = "sap.galactic.spacefarer";
const OUT_DIR = join(__dirname, "..", "db", "data");

const FOCUS_PLANETS = ["Kepler-22b", "Mars"] as const;
const OTHER_PLANETS = [
  "Proxima Centauri b",
  "TRAPPIST-1e",
  "TRAPPIST-1d",
  "Kepler-452b",
  "Kepler-186f",
  "Gliese 581g",
  "HD 40307g",
  "55 Cancri e",
] as const;

const SPACEFARERS_PER_FOCUS_PLANET = 8;
const OTHER_SPACEFARERS = 15;
const DEPARTMENTS_PER_PLANET = 2;
const POSITIONS_PER_PLANET = 6;

faker.seed(42);

const positions: Positions = Array.from(
  { length: POSITIONS_PER_PLANET },
  (_, i) => ({
    ID: randomUUID(),
    name: faker.helpers.arrayElement([
      "Navigator",
      "Stardust Engineer",
      "Wormhole Pilot",
      "Comms Officer",
      "Xenobiologist",
      "Fleet Commander",
    ]),
  }),
);

const departments: Array<ManagedDepartment> = [
  ...FOCUS_PLANETS,
  ...OTHER_PLANETS,
].flatMap((planet) =>
  Array.from({ length: DEPARTMENTS_PER_PLANET }, (_, i) => ({
    ID: randomUUID(),
    name: `${planet} ${faker.commerce.department()} Division`,
    planet,
  })),
);

const departmentRows: Departments = departments.map(
  ({ planet, ...rest }) => rest,
);

function generateSpacefarersForPlanet(
  planet: string,
  count: number,
): Spacefarers {
  const deptIdsForPlanet = departments
    .filter((d) => d.planet === planet)
    .map((d) => d.ID);

  return Array.from({ length: count }, (_, i) => ({
    ID: randomUUID(),
    name: faker.person.fullName(),
    stardustCollection: faker.number.int({ min: 0, max: 10000 }),
    wormholeNavSkill: faker.number.int({ min: 0, max: 10 }),
    originPlanet: planet,
    spacesuitColor: faker.color.human(),
    department_ID: faker.helpers.arrayElement(deptIdsForPlanet),
    position_ID: faker.helpers.arrayElement(positions).ID,
  }));
}

const spacefarers: Spacefarers = [
  ...FOCUS_PLANETS.flatMap((planet) =>
    generateSpacefarersForPlanet(planet, SPACEFARERS_PER_FOCUS_PLANET),
  ),
  ...faker.helpers.multiple(
    () =>
      generateSpacefarersForPlanet(
        faker.helpers.arrayElement(OTHER_PLANETS),
        1,
      )[0],
    { count: OTHER_SPACEFARERS },
  ),
];

function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? "")).join(","),
    ),
  ];

  return csv.join("\n");
}

function write<T extends Record<string, unknown>>(
  entity: string,
  rows: T[],
): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `${NAMESPACE}-${entity}.csv`);
  writeFileSync(path, toCsv<T>(rows), "utf-8");
  console.log(`Wrote ${rows.length} rows to ${path}`);
}

write("Departments", departmentRows as Record<string, unknown>[]);
write("Positions", positions as Record<string, unknown>[]);
write("Spacefarers", spacefarers as Record<string, unknown>[]);
