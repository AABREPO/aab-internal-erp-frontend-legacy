import DatabaseExpenses from '../ExpensesEntry/DatabaseExpenses';

const UTILITY_ENDPOINT = 'https://backendaab.in/aabuilderDash/expenses_form/utility/telecom';

const TelecomDatabase = ({ username, userRoles = [] }) => (
    <DatabaseExpenses
        username={username}
        userRoles={userRoles}
        utilityEndpoint={UTILITY_ENDPOINT}
        utilityType="Telecom"
    />
);

export default TelecomDatabase;
