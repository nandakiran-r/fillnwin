const ParticipantCard = ({ participant, showActions = false, onRemove }) => {
    return (
        <div className="glass-card fade-in" style={{
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <h4 style={{
                    fontSize: '1.1rem',
                    marginBottom: '0.25rem',
                    color: 'var(--festive-gold)'
                }}>
                    {participant.fullName}
                </h4>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    margin: '0.25rem 0'
                }}>
                    📞 {participant.phone}
                </p>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    margin: '0.25rem 0'
                }}>
                    🏢 {participant.divisonalOffice}
                </p>
                {participant.vehicleType && (
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        margin: '0.25rem 0'
                    }}>
                        🚗 {participant.vehicleType}
                        {participant.vehicleRegistrationNumber && ` - ${participant.vehicleRegistrationNumber}`}
                    </p>
                )}
                {participant.retailOutletName && (
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        margin: '0.25rem 0'
                    }}>
                        🏪 {participant.retailOutletName}
                    </p>
                )}
                <div className="badge badge-gold" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                    {participant.ticketNumber}
                </div>
            </div>

            {showActions && onRemove && (
                <button
                    onClick={() => onRemove(participant.id)}
                    className="btn btn-primary"
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem'
                    }}
                >
                    Remove
                </button>
            )}
        </div>
    );
};

export default ParticipantCard;
