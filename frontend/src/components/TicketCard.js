import React from 'react';

export default function TicketCard({ ticket }) {
  return (
    <div className="ticketCard">
      <div className="ticketTop">
        <span className="ticketToken">{ticket.token}</span>
        <span className={`statusBadge ${ticket.status === 'ACTIVE' ? 'active' : 'closed'}`}>{ticket.status}</span>
      </div>
      <div className="ticketDetail"><strong>Plate:</strong> {ticket.vehiclePlate}</div>
      <div className="ticketDetail"><strong>Spot:</strong> {ticket.sensorId}</div>
      <div className="ticketDetail"><strong>Entry:</strong> {new Date(ticket.entryTime).toLocaleString()}</div>
      {ticket.status === 'CLOSED' ? (
        <>
          <div className="ticketDetail"><strong>Exit:</strong> {new Date(ticket.exitTime).toLocaleString()}</div>
          <div className="ticketDetail"><strong>Fee:</strong> ₹{ticket.fee}</div>
        </>
      ) : null}
    </div>
  );
}
