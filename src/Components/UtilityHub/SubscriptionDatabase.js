import DatabaseExpenses from '../ExpensesEntry/DatabaseExpenses';

const UTILITY_ENDPOINT = 'https://backendaab.in/aabuilderDash/expenses_form/utility/subscription';

const SubscriptionDatabase = ({ username, userRoles = [] }) => (
    <DatabaseExpenses
        username={username}
        userRoles={userRoles}
        utilityEndpoint={UTILITY_ENDPOINT}
        utilityType="Subscription"
    />
);

export default SubscriptionDatabase;
