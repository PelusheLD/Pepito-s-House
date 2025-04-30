import ReservationForm from "./reservation-form";

export default function ReservationSection() {
  return (
    <section id="reservas" className="py-20 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-800 mb-3">
            Reserva tu Mesa
          </h2>
          <p className="text-lg text-neutral-800/80 max-w-2xl mx-auto">
            Reserva tu mesa con anticipación para garantizar la mejor experiencia gastronómica. 
            Completa el formulario y nos pondremos en contacto contigo para confirmar tu reserva.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ReservationForm />
        </div>
        
        <div className="mt-10 text-center text-sm text-neutral-600">
          <p className="mb-2">También puedes hacer tu reserva llamando al <span className="font-semibold">(123) 456-7890</span></p>
          <p>Las reservas requieren confirmación. Te contactaremos vía WhatsApp para confirmar tu reserva.</p>
        </div>
      </div>
    </section>
  );
}