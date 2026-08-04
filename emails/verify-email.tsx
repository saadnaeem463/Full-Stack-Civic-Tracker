import {Head,Html,Body,Text,Container,Link } from "@react-email/components"

interface VerifyEmailProps{
    verifyUrl : string,
    name : string
}

export default function verifyEmail({verifyUrl,name} : VerifyEmailProps){
    return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif" }}>
        <Container style={{ maxWidth: "600px" }}>
          <Text>Hi {name},</Text>
          <Text>Click below to verify your email:</Text>
          <Link href={verifyUrl}>Verify Email</Link>
        </Container>
      </Body>
    </Html>
  );
}