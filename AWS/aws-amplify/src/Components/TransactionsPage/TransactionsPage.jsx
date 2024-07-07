import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../Alert/Alert';
import TransactionsAccountInfoTable from '../TransactionsAccountInfoTable/TransactionsAccountInfoTable';
import TransactionsInfoTable from '../TransactionsInfoTable/TransactionsInfoTable';
import InternalTransactionsInfoTable from '../InternalTransactionsInfoTable/InternalTransactionsInfoTable';
import { resetAddress } from '../../redux/reducer/walletAddressReducer';
import { currentCoinPrice } from '../../UtilFunctions/currentCoinPrice';
import { currentCoinPricePro } from '../../UtilFunctions/currentCoinPricePRO';
import { openseaAccountInformation } from '../../UtilFunctions/openseaAccountInfo';
import { walletBalance } from '../../UtilFunctions/walletBalance';
import { walletInternalTransactions } from '../../UtilFunctions/walletInternalTransactions';
import { walletTransactions } from '../../UtilFunctions/walletTransactions';
import OpenseaAccountInfoTable from '../OpenseaAccountInfoTable/OpenseaAccountInfoTable';

const Transactions = () => {
    const walletAddress = useSelector(state => state.wallet.walletAddress);
    const dispatch = useDispatch();

    // Setting React Query for different calls such as pricing, balances, transactions, and internal transactions
    const ethPriceQuery = useQuery({
        queryKey: ['eth price', 'ethereum'],
        queryFn: currentCoinPricePro
    });

    const openseaAccountQuery = useQuery({
        queryKey: ['opensea account', walletAddress],
        queryFn: openseaAccountInformation
    });

    const walletBalancesQuery = useQuery({
        queryKey: ['wallet balance', walletAddress],
        queryFn: walletBalance
    });

    const walletTransactionsQuery = useQuery({
        queryKey: ['transactions', walletAddress],
        queryFn: walletTransactions
    });

    const walletInternalTransactionsQuery = useQuery({
        queryKey: ['internal transactions', walletAddress],
        queryFn: walletInternalTransactions
    });

    const navigate = useNavigate();

    // Redirect if invalid wallet is asked to be entered again as it is removed from system
    useEffect(() => {
        if ((walletAddress === null) || (walletAddress.length !== 42) || (walletAddress.substring(0, 2) !== '0x')){
            dispatch(resetAddress()); // Clear wallet address state in Redux store and navigate to home
            navigate('/');
        }
    }, []);
    
    // Conditionally render page based on alerts when wallet is either empty or invalid
    if ( ethPriceQuery.isError || openseaAccountQuery.isError || walletBalancesQuery.isError || walletInternalTransactionsQuery.isError || walletTransactionsQuery.isError) {
        return (
            <main role="main" class="p-3">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Transactions</h1>
                </div>
                <Alert type='warning' />
                <button className='btn btn-success' onClick={() => navigate("/")} style={{ marginTop: '3rem' }}>Go Home</button>
            </main>
        )
    }
    else if ( ethPriceQuery.isLoading || openseaAccountQuery.isLoading || walletBalancesQuery.isLoading || walletTransactionsQuery.isLoading || walletInternalTransactionsQuery.isLoading) {
        return <div role="main" class="p-3">Loading...</div>
    }
    else if (ethPriceQuery.isSuccess && walletBalancesQuery.isSuccess && walletTransactionsQuery.isSuccess && walletInternalTransactionsQuery.isSuccess && openseaAccountQuery.isSuccess) {
        
        // Set alerts for displaying if certain types of transactions are empty
        let emptyInteralTransactionAlert = walletInternalTransactionsQuery.data.result.length === 0 ? true: false;
        let transactionsAlert = walletTransactionsQuery.data.result.length === 0 ? true: false;
        
        return ( 
            <>
                <main role="main" class="p-3">
                    <div>                    
                        <h1>Transactions</h1>
                        <hr />
                    </div>
                    <TransactionsAccountInfoTable walletAddress={ walletAddress } walletBalance={ walletBalancesQuery.data } ethPrice={ ethPriceQuery.data[0] } />
                </main>  
                <hr style={{ marginTop: '2rem' }}/>          
                <main class="p-3" role="main">
                        <div>
                            {
                                transactionsAlert ? null :
                                    <>
                                        <OpenseaAccountInfoTable data={ openseaAccountQuery.data } />                                
                                    </>
                            }
                        </div>
                </main>
                <hr style={{ marginTop: '2rem' }}/>          
                <main class="p-3" role="main">
                        <div>
                            {
                                transactionsAlert ? null :
                                    <>
                                        <TransactionsInfoTable walletAddress={ walletAddress } networkFetch={false} data={ walletTransactionsQuery.data.result } />                                
                                    </>
                            }
                        </div>
                </main>
                <hr style={{ marginTop: '2rem' }}/>          
                <main style={{ marginTop: '1rem' }} class="p-3" role="main">
                        <div>
                            {
                                emptyInteralTransactionAlert ? <Alert type='warning-empty-internal' /> :
                                (
                                    walletTransactionsQuery.data === null ? null :
                                        <>
                                            <InternalTransactionsInfoTable walletAddress={ walletAddress } data={ walletInternalTransactionsQuery.data.result } /> 
                                        </>
                                )
                            }
                        </div>
                </main>
                <main role="main" class="p-3">
                    <button style={{ marginTop: '1rem' }} class="btn btn-success" onClick={() => { dispatch(resetAddress()); navigate("/"); }}>Go Back</button>
                </main>
            </>
        )
    }
}

export default Transactions;