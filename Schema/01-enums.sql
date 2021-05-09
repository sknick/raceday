CREATE TYPE broadcast_type AS ENUM (
    'Cable',
    'Facebook',
    'F1_TV',
    'Motorsport_tv',
    'MotorTrend',
    'Other',
    'YouTube'
);

CREATE TYPE audited_action AS ENUM (
    'added',
    'deleted',
    'updated'
);
