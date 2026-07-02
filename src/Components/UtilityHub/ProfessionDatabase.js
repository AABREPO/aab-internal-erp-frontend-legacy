import DatabaseExpenses from '../ExpensesEntry/DatabaseExpenses';

const UTILITY_ENDPOINT = 'https://backendaab.in/aabuilderDash/expenses_form/utility/profession';

const ProfessionDatabase = ({ username, userRoles = [] }) => (
    <DatabaseExpenses
        username={username}
        userRoles={userRoles}
        utilityEndpoint={UTILITY_ENDPOINT}
        utilityType="Profession"
    />
);

export default ProfessionDatabase;
