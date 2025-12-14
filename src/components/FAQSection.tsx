
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function FAQSection() {
    const faqs = [
        {
            question: "What if a student doesn't have a phone?",
            answer: "No problem. Teachers can mark students as present manually with a single click from the dashboard. You can also export a printable sign-in sheet if needed."
        },
        {
            question: "Does this work offline?",
            answer: "Yes! The mobile app caches attendance data locally. If you or a student loses connection, the data will automatically sync to our secure servers once internet access is restored."
        },
        {
            question: "Is student data private?",
            answer: "Absolutely. We adhere to strict GDPR and FERPA compliance standards. Student data is encrypted at rest and in transit, and we never sell data to third parties."
        },
        {
            question: "Can I try it before purchasing?",
            answer: "Yes, we offer a free tier that allows you to manage up to 3 classes forever. No credit card required to get started."
        },
        {
            question: "How does the geo-fencing work?",
            answer: "We use the device's GPS to verify that the student is physically present in the classroom during the check-in window. This prevents students from checking in from their dorms or coffee shops."
        }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">
                    Support
                </Badge>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground">
                    Everything you need to know about EduTrack.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border rounded-lg px-6 bg-card data-[state=open]:border-primary/50 transition-colors"
                    >
                        <AccordionTrigger className="text-lg font-medium hover:no-underline py-6">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-lg pb-6 leading-relaxed">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
