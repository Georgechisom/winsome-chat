import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Decentralized",
    description:
      "Built on blockchain technology for true decentralization and censorship resistance.",
  },
  {
    title: "Secure",
    description:
      "End-to-end encryption ensures your conversations remain private and secure.",
  },
  {
    title: "Web3 Native",
    description:
      "Seamlessly integrates with Web3 wallets and decentralized identity systems.",
  },
  {
    title: "Community Driven",
    description:
      "Governed by the community with transparent smart contracts and open-source code.",
  },
];

const team = [
  {
    name: "Alice Johnson",
    role: "Founder & CEO",
    bio: "Blockchain expert with 5+ years in Web3 development.",
  },
  {
    name: "Bob Smith",
    role: "CTO",
    bio: "Smart contract specialist and cryptography researcher.",
  },
  {
    name: "Charlie Brown",
    role: "Lead Developer",
    bio: "Full-stack developer focused on decentralized applications.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-bg flex items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            About Winsome Chat
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Revolutionizing communication in the decentralized world. Connect,
            chat, and collaborate securely with Web3 technology.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Our Mission
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Winsome Chat is dedicated to creating a decentralized communication
            platform that empowers users with true ownership of their data and
            conversations. We believe in a future where communication is free
            from centralized control and surveillance.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Winsome Chat?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md text-center"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                    {member.name[0]}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {member.name}
                  </CardTitle>
                  <p className="text-primary font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Have questions or want to contribute? Reach out to us!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@winsomechat.com"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Email Us
            </a>
            <a
              href="https://github.com/winsomechat"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-6 py-3 rounded-md hover:bg-accent transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
