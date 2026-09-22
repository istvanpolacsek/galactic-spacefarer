namespace sap.galactic.spacefarer;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Spacefarer : cuid, managed {
    name               : String(111);
    originPlanet       : String(50);
    stardustCollection : Integer;
    wormholeNavSkill   : Integer;
    spacesuitColor     : String(30);
    department         : Association to Department;
    position           : Association to Position;
}

entity Department : cuid {
    name        : String(111);
    spacefarers : Association to many Spacefarer
                      on spacefarers.department = $self;
}

entity Position : cuid {
    name        : String(111);
    spacefarers : Association to many Spacefarer
                      on spacefarers.position = $self;
}
