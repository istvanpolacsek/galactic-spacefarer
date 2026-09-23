using SpacefarerService as service from '../../srv/spacefarer-service';

annotate service.Spacefarers with @(
    UI.FieldGroup #GeneratedGroup: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: 'Spacefarer Name',
                Value: name,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Origin Planet',
                Value: originPlanet,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Stardust Collection',
                Value: stardustCollection,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Wormhole Nav Skill',
                Value: wormholeNavSkill,
            },
            {
                $Type: 'UI.DataField',
                Label: 'Spacesuit Color',
                Value: spacesuitColor,
            },
            {
                $Type: 'UI.DataField',
                Value: department_ID,
                Label: 'Department',
            },
            {
                $Type: 'UI.DataField',
                Value: position_ID,
                Label: 'Position',
            },
        ],
    },
    UI.Facets                    : [{
        $Type : 'UI.ReferenceFacet',
        ID    : 'GeneratedFacet1',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneratedGroup',
    }, ],
    UI.LineItem                  : [
        {
            $Type: 'UI.DataField',
            Label: 'Spacefarer Name',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Origin Planet',
            Value: originPlanet,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Stardust Collection',
            Value: stardustCollection,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Wormhole Nav Skill',
            Value: wormholeNavSkill,
        },
        {
            $Type: 'UI.DataField',
            Label: 'Spacesuit Color',
            Value: spacesuitColor,
        },
        {
            $Type: 'UI.DataField',
            Value: department_ID,
            Label: 'Department',
        },
        {
            $Type: 'UI.DataField',
            Value: position_ID,
            Label: 'Position',
        },
    ],
    UI.SelectionFields           : [
        originPlanet,
        wormholeNavSkill,
        stardustCollection,
        position_ID,
        department_ID,
    ],
    UI.FieldGroup #Info          : {
        $Type: 'UI.FieldGroupType',
        Data : [],
    },
);

annotate service.Spacefarers with {
    department @(
        Common.ValueList   : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Departments',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: department_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                },
            ],
        },
        Common.ExternalID  : department.name,
        Common.Label       : 'Department',
        Common.FieldControl: lockedFieldControl,
    )
};

annotate service.Spacefarers with {
    position @(
        Common.ValueList   : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Positions',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: position_ID,
                    ValueListProperty: 'ID',
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name',
                },
            ],
        },
        Common.ExternalID  : position.name,
        Common.Label       : 'Position',
        Common.FieldControl: lockedFieldControl,
    )
};

annotate service.Spacefarers with {
    name @(
        Common.Label       : 'Spacefarer Name',
        Common.FieldControl: lockedFieldControl,
    )
};

annotate service.Spacefarers with {
    originPlanet @(
        Common.Label       : 'Origin Planet',
        Common.FieldControl: lockedFieldControl,
    )
};

annotate service.Departments with {
    name @(
        Common.Label     : 'Department',
        Common.ExternalID: name,
    )
};

annotate service.Positions with {
    name @(
        Common.Label     : 'Position',
        Common.ExternalID: name,
    )
};

annotate service.Spacefarers with {
    wormholeNavSkill @(
        Common.Label       : 'Wormhole Nav Skill',
        Common.FieldControl: lockedFieldControl,
    )
};

annotate service.Spacefarers with {
    stardustCollection @Common.Label: 'Stardust Collection'
};

annotate service.Spacefarers with {
    lockedFieldControl @UI.Hidden;
};
