namespace sap.galactic.spacefarer;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Spacefarers : cuid, managed {
    name               : String(111);
    originPlanet       : String(50);
    stardustCollection : Integer;
    wormholeNavSkill   : Integer;
    spacesuitColor     : String(30);
    department         : Association to Departments;
    position           : Association to Positions;
}

entity Departments : cuid {
    name        : String(111);
    spacefarers : Association to many Spacefarers
                      on spacefarers.department = $self;
}

entity Positions : cuid {
    name        : String(111);
    spacefarers : Association to many Spacefarers
                      on spacefarers.position = $self;
}
