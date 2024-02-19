import {
  Button,
  Html,
  Tailwind,
  Preview,
  Head,
  Body,
  Text,
  Container,
  Font,
  Section,
  Hr,
  Link,
  Img,
} from "@react-email/components";
import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";

interface EmailRecWithUser {
  avatarPhotoUrl: string;
  title: string;
  link: string;
  author: string;
  year: string;
  username: string;
  description: string;
}

interface EmailRecCardProps {
  recsWithUsers: EmailRecWithUser[];
}

function EmailRecCard(props: EmailRecCardProps) {
  const { recsWithUsers } = props;
  if (recsWithUsers.length === 0) {
    return null;
  }
  const rec = recsWithUsers[0];
  return (
    <Container className="p-2">
      <Container className="p-3 bg-[#F1F1F1] rounded-md mb-2">
        <Link href={rec.link} className="text-brand">
          <Text className="text-[18px]">{rec.title}</Text>
        </Link>
        <Text>{rec.author}</Text>
        <div className="flex flex-row items-center text-[14px] gap-x-2">
          <CalendarIcon className="w-4 h-4" />
          <div>{rec.year}</div>
        </div>
      </Container>
      {recsWithUsers.map((recWithUser, idx) => {
        return (
          <Container key={idx} className="px-4 pt-1">
            <div className="flex flex-row items-center gap-x-4">
              <Img
                src={recWithUser.avatarPhotoUrl}
                alt="avatar"
                className="w-[40px] aspect-square rounded-[999px] object-cover"
              />
              <Text>{recWithUser.username}</Text>
            </div>
            <Text>{recWithUser.description}</Text>
          </Container>
        );
      })}
    </Container>
  );
}

const mockRec: EmailRecWithUser = {
  avatarPhotoUrl:
    "https://lh3.googleusercontent.com/a/ACg8ocL6DSnMAUCuiMFjcvW477_gHLTaBDOUP5vgv5mSVO5fJs8=s96-c",
  title:
    "Infini-gram: Scaling Unbounded n-gram Language Models to a Trillion Tokens",
  link: "https://arxiv.org/abs/2401.17377",
  author:
    "Jiacheng Liu, Sewon Min, Luke Zettlemoyer, Yejin Choi, Hannaneh Hajishirzi",
  year: "2024",
  username: "Frank Hsu",
  description:
    "N-grams with 1 trillion tokens! Fast suffix arrays! What's not to like? (They don't compute perplexities or generate from the ngram model.. but otherwise, super cool thing to try!)",
};

const WeeklyDigest = () => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#3591FF",
                text: "#60646C",
              },
            },
          },
        }}
      >
        <Preview>📬 Your RecNet weekly digest is here!</Preview>
        <Head>
          <Font
            fontFamily="Roboto"
            fallbackFontFamily="Verdana"
            webFont={{
              url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
        </Head>
        <Body className="bg-white text-text">
          <Container>
            <Text className="w-full text-center text-[28px] font-bold text-brand">
              RecNet
            </Text>
            <Hr />
            <Section className="p-2 flex flex-col items-center">
              <Text className="text-[18px]">
                📬 Your Weekly Recommended Papers
              </Text>
              <Text className="text-[16px]">{`You have ${3} recommendations this week!`}</Text>
              <Text>
                Check out these rec'd paper for you from your network!
              </Text>
            </Section>
            <Hr />
            {Array.from({ length: 3 }).map((_, i) => (
              <EmailRecCard key={i} recsWithUsers={[mockRec]} />
            ))}
            <Hr />
            <Section className="px-2">
              <Text className="text-[16px]">
                Any interesting read this week? 👀
              </Text>
              <div className="w-full flex justify-center">
                <Button
                  href="https://recnet.io"
                  className="bg-brand w-full text-center text-white rounded-md p-2"
                >
                  Share it with your network!
                </Button>
              </div>
            </Section>
            <Text className="text-text opacity-[40%] p-2 text-[12px]">
              Please reply directly if you find anerror. Thank you!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WeeklyDigest;
