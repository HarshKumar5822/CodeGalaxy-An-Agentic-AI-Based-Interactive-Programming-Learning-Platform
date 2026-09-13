import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-2 gap-12"
                    >
                        <div className="space-y-8">
                            <div>
                                <h1 className="font-display text-4xl font-bold text-foreground mb-4">Contact Us</h1>
                                <p className="text-muted-foreground text-lg">
                                    Have questions or feedback? We'd love to hear from you. Fill out the form or reach out via email.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                                    <Mail className="h-6 w-6 text-cq-cyan" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">Email</h3>
                                        <p className="text-sm text-muted-foreground">harshkragrawal2006@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                                    <MessageSquare className="h-6 w-6 text-cq-purple" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">Community</h3>
                                        <p className="text-sm text-muted-foreground">Join our Discord server</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-border/50 bg-card">
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Name</label>
                                    <Input placeholder="Your name" className="bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Email</label>
                                    <Input type="email" placeholder="your@email.com" className="bg-muted/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Message</label>
                                    <Textarea placeholder="How can we help?" className="min-h-[150px] bg-muted/50 border-border/50" />
                                </div>
                                <Button className="w-full gap-2">
                                    <Send className="h-4 w-4" />
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
