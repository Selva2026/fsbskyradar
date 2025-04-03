import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import axios from 'axios';

const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 }
});

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Extract booking details
    const bookingId = queryParams.get("bookingId");
    const status = queryParams.get("status");
    const flightName = queryParams.get("flightName");
    const departure = queryParams.get("departure");
    const arrival = queryParams.get("arrival");
    const date = queryParams.get("date");
    const price = queryParams.get("price");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const requestSentRef = useRef(false);

    useEffect(() => {
        if (bookingId && !requestSentRef.current) {
            requestSentRef.current = true;
            updateBookingStatus();
        } else if (!bookingId) {
            setMessage('Booking ID not found.');
            setLoading(false);
        }
    }, [bookingId]);

    const updateBookingStatus = async () => {
        try {
            const response = await axios.put('https://fsbbackend.onrender.com/api/bookings/status', {
                bookingId,
                status: 'confirmed'
            });

            if (response.status === 200) {
                setEmailSent(true);
                setMessage('Booking confirmed successfully.');
            } else {
                setMessage('Failed to confirm booking.');
            }
        } catch (error) {
            setMessage('Error confirming booking.');
        } finally {
            setLoading(false);
        }
    };

    const ConfirmationDocument = () => (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}><Text>Booking Confirmation</Text></View>
                <View style={styles.section}><Text>Booking ID: {bookingId}</Text></View>
                <View style={styles.section}><Text>Status: {status}</Text></View>
                <View style={styles.section}><Text>Flight: {flightName}</Text></View>
                <View style={styles.section}><Text>Departure: {departure}</Text></View>
                <View style={styles.section}><Text>Arrival: {arrival}</Text></View>
                <View style={styles.section}><Text>Date: {date}</Text></View>
                <View style={styles.section}><Text>Price: ${price}</Text></View>
            </Page>
        </Document>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6 font-pop">
            <div className="bg-slate-800 shadow-lg p-8 rounded-lg text-center border border-slate-700 max-w-md">
                <div className="w-16 h-16 mx-auto mb-4">
                    <svg className="text-green-500 w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-400 font-pop">Payment Success!</h1>
                <p className="mt-2 text-lg text-gray-300 font-pop">Your payment has been processed successfully.</p>

                {loading ? (
                    <p className="mt-4 text-gray-400 animate-pulse font-pop">Updating booking status...</p>
                ) : (
                    <>
                        <p className="mt-3 text-gray-300 font-pop">{message}</p>
                        {emailSent && (
                            <p className="mt-2 text-blue-400 font-semibold font-pop">
                                A confirmation email with flight details has been sent to your email.
                            </p>
                        )}
                        <div className="mt-4">
                            <PDFDownloadLink document={<ConfirmationDocument />} fileName="booking-confirmation.pdf">
                                {({ loading }) => (
                                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-lg hover:bg-blue-600 transition font-pop">
                                        {loading ? 'Generating PDF...' : 'Download Confirmation'}
                                    </button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </>
                )}

                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 px-5 py-3 bg-amber-500 text-white rounded-lg text-lg hover:bg-amber-600 transition font-pop"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
