import DatabaseExpenses from '../ExpensesEntry/DatabaseExpenses';

const UTILITY_ENDPOINT = 'https://backendaab.in/aabuilderDash/expenses_form/utility/amc';

const AMCDatabase = ({ username, userRoles = [] }) => (
    <DatabaseExpenses
        username={username}
        userRoles={userRoles}
        utilityEndpoint={UTILITY_ENDPOINT}
        utilityType="AMC"
    />
);

export default AMCDatabase;
