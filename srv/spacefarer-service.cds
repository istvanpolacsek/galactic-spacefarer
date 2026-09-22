using {sap.galactic.spacefarer as entities} from '../db/schema';

@requires: 'authenticated-user'
service SpacefarerService {
    @restrict: [
        {
            grant: [
                'READ',
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'SpacefarerAdmin'
        },
        {
            grant: ['READ'],
            to   : 'authenticated-user',
            where: 'originPlanet = $user.planet'
        }
    ]
    entity Spacefarers as projection on entities.Spacefarers;

    @readonly
    entity Departments as projection on entities.Departments;

    @readonly
    entity Positions   as projection on entities.Positions;
}
