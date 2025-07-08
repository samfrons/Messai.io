# Discovery Questions

## Q1: Is this platform handling critical research data that must never be lost?
**Default if unknown:** Yes (research platforms typically contain irreplaceable experimental data)

## Q2: Will the platform be deployed to production servers where automated backups are essential?
**Default if unknown:** Yes (any production deployment needs backup strategies)

## Q3: Do you need point-in-time recovery capabilities for data corruption scenarios?
**Default if unknown:** Yes (scientific data requires ability to recover from specific timestamps)

## Q4: Should the backup system include user experiment data and configurations beyond just user accounts?
**Default if unknown:** Yes (research platforms need complete data preservation including experiments)

## Q5: Will you need database migration safety checks to prevent data loss during schema updates?
**Default if unknown:** Yes (evolving research platforms require safe migration practices)