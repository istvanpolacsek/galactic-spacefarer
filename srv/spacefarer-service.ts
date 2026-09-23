import cds, { Request } from "@sap/cds";
import { Spacefarer, Spacefarers } from "#cds-models/SpacefarerService";
import { sendWelcomeEmail } from "./lib/mailer";

export class SpacefarerService extends cds.ApplicationService {
  async init() {
    this.before("CREATE", Spacefarers, this.onBeforeCreateSpacefarer);
    this.after("CREATE", Spacefarers, this.onAfterCreateSpacefarer);
    this.before("UPDATE", Spacefarers, this.onBeforeUpdateSpacefarer);
    this.after("READ", Spacefarers, this.setFieldControl);
    this.after("READ", Spacefarers.drafts, this.setFieldControl);
    this.after("EDIT", Spacefarers, this.setFieldControl);
    this.after("NEW", Spacefarers.drafts, this.setFieldControl);

    return super.init();
  }

  private onBeforeCreateSpacefarer(req: Request<Spacefarer>) {
    const { stardustCollection, wormholeNavSkill } = req.data;

    if (stardustCollection != null && stardustCollection < 0) {
      req.error(400, "stardustCollection must be non-negative");
    }

    if (
      wormholeNavSkill != null &&
      (wormholeNavSkill < 0 || wormholeNavSkill > 10)
    ) {
      req.error(400, "wormholeNavSkill must be between 0 and 10");
    }

    Object.assign(req.data, {
      // Enhance the rookie spacefarers stardust collection by adding a bonus of 10
      stardustCollection: (stardustCollection ?? 0) + 10,
      // Set the initial wormhole navigation skill to 1 if not provided
      wormholeNavSkill: wormholeNavSkill ?? 1,
    });
  }

  private async onAfterCreateSpacefarer(data: Spacefarers, req: Request) {
    if (data.length === 1) {
      const [{ ID, name, originPlanet }] = data;

      try {
        const previewUrl = await sendWelcomeEmail({ name, originPlanet });

        console.log(
          `[SpacefarerService] Welcome email sent for spacefarer ${ID}: ${previewUrl}`,
        );
      } catch (error) {
        console.error(
          "[SpacefarerService] Failed to send welcome email",
          error,
        );
      }
    }
  }

  private async onBeforeUpdateSpacefarer(req: Request<Spacefarer>) {
    if (req.user.is("SpacefarerAdmin")) return;

    const LOCKED_FOR_USERS = [
      "name",
      "originPlanet",
      "wormholeNavSkill",
      "department_ID",
      "position_ID",
    ] as const;

    const current = await SELECT.one.from(req.subject);
    const data = req.data as Spacefarer;
    const changed = LOCKED_FOR_USERS.filter(
      (key) => current[key] !== data[key],
    );

    if (changed.length > 0) {
      req.reject(
        403,
        `You are not allowed to update the following fields: ${changed.join(", ")}`,
      );
    }
  }

  private setFieldControl(data: Spacefarers, req: Request) {
    const fieldControlValue = req.user.is("SpacefarerAdmin") ? 3 : 1;
    const rows = [data].flat();

    rows.forEach((row) => {
      row.lockedFieldControl = fieldControlValue;
    });
  }
}
