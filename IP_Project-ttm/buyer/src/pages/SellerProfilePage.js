import { useParams } from 'react-router-dom';
import MainNav from '../components/MainNav';

function SellerProfilePage() {
    const { sellerId } = useParams();

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>Seller Profile</h1>
                {sellerId && <p>Seller ID: {sellerId}</p>}
            </section>
        </main>
    );
}

export default SellerProfilePage;
