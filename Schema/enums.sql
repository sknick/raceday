CREATE TYPE broadcast_type AS ENUM (
    'Cable',
    'Facebook',
    'MotorTrend',
    'Other',
    'YouTube'
);

CREATE TYPE audited_action AS ENUM (
    'added',
    'deleted',
    'updated'
);
