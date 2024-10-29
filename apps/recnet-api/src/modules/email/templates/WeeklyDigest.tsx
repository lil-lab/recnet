import { CalendarIcon } from "@radix-ui/react-icons";
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

import { formatDate } from "@recnet/recnet-date-fns";

import {
  Rec,
  Announcement,
  generateMock,
  announcementSchema,
  recSchema,
} from "@recnet/recnet-api-model";

interface EmailRecCardProps {
  recs: Rec[];
}

function Badge(props: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FFEFDD] text-[#D14E00] rounded-md px-2 py-1 text-[12px] w-fit max-w-fit">
      {props.children}
    </div>
  );
}

function EmailRecCard(props: EmailRecCardProps) {
  const { recs } = props;
  if (recs.length === 0) {
    return null;
  }
  const rec = recs[0];
  return (
    <Container className="p-2">
      <Container className="p-3 bg-[#F1F1F1] rounded-md mb-2">
        <Link href={rec.article.link} className="text-brand">
          <Text className="text-[18px]">{rec.article.title}</Text>
        </Link>
        <Text>{rec.article.author}</Text>
        <div className="flex flex-row items-center text-[14px] gap-x-2">
          <CalendarIcon className="w-4 h-4" />
          <div>{rec.article.year}</div>
        </div>
      </Container>
      {recs.map((rec, idx) => {
        return (
          <Container key={`${rec.user.id}-${idx}`} className="px-4 pt-1">
            <div className="flex flex-row items-center gap-x-4">
              <Img
                src={rec.user.photoUrl}
                alt="avatar"
                className="w-[40px] aspect-square rounded-[999px] object-cover"
              />
              <Text>{rec.user.displayName}</Text>
              {rec.isSelfRec ? <Badge>{"Self Rec"}</Badge> : null}
            </div>
            <Text>{rec.description}</Text>
          </Container>
        );
      })}
    </Container>
  );
}

function getMockWeeklyDigestData(): WeeklyDigestProps {
  return {
    env: "development",
    recsGroupByTitle: {
      "Paper Title 1": [generateMock(recSchema)],
      "Paper Title 2": [generateMock(recSchema), generateMock(recSchema)],
      "Paper Title 3": [generateMock(recSchema)],
    },
    numUnusedInviteCodes: 3,
    latestAnnouncement: generateMock(announcementSchema, {
      stringMap: {
        content: () => "This is a test announcement!",
      },
    }),
  };
}

interface WeeklyDigestProps {
  env?: string;
  recsGroupByTitle?: Record<string, Rec[]>;
  numUnusedInviteCodes?: number;
  latestAnnouncement?: Omit<Announcement, "startAt" | "endAt">;
}

const WeeklyDigest = (props: {
  env?: string;
  recsGroupByTitle?: Record<string, Rec[]>;
  numUnusedInviteCodes?: number;
  latestAnnouncement?: Omit<Announcement, "startAt" | "endAt">;
}) => {
  /**
    Use mock data if testing via email:dev command for testing purposes
  */
  const data = !props.env ? getMockWeeklyDigestData() : props;
  const {
    recsGroupByTitle = {},
    latestAnnouncement,
    numUnusedInviteCodes,
  } = data;
  const recsCount = Object.keys(recsGroupByTitle).length;

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
              <Text className="text-[16px]">{`You have ${recsCount} recommendations this week!`}</Text>
              <Text>
                {recsCount > 0 ? (
                  `Check out these rec'd paper for you from your network!`
                ) : (
                  <span>
                    Visit{" "}
                    <a
                      className="text-brand"
                      href="https://recnet.io"
                      target="_blank"
                      rel="noreferrer"
                    >
                      RecNet
                    </a>{" "}
                    to find more papers!
                  </span>
                )}
              </Text>
            </Section>
            {latestAnnouncement ? (
              <Container>
                <Hr className="pb-1" />
                <div className="m-2 p-4 rounded-lg bg-[#3591FF40] flex flex-col gap-y-1 text-[14px]">
                  <Text className="my-0">
                    <span className="mr-1">{"📢"}</span>
                    <span className="font-bold mr-1">
                      {latestAnnouncement.title}
                    </span>
                  </Text>
                  <Text className="my-0">{latestAnnouncement.content}</Text>
                </div>
              </Container>
            ) : null}
            {Object.keys(recsGroupByTitle).map((key, i) => {
              const recs = recsGroupByTitle[key];
              return (
                <React.Fragment key={`${key}-${i}`}>
                  {i === 0 ? null : <Hr />}
                  <EmailRecCard recs={recs} />
                </React.Fragment>
              );
            })}
            <Hr />
            <Section className="px-4 py-2">
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
            {numUnusedInviteCodes && numUnusedInviteCodes > 0 ? (
              <>
                <Hr className="mb-0 py-0" />
                <Container className="flex justify-center">
                  <Text className="text-[12px]">
                    You have {numUnusedInviteCodes} unused invite code
                    {numUnusedInviteCodes > 1 ? "s" : ""}! Share the love ❤️
                  </Text>
                </Container>
              </>
            ) : null}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const WeeklyDigestSubject = (cutOffDate: Date, nodeEnv: string) => {
  const devPrefix = nodeEnv !== "production" ? "[DEV] " : "";
  return `${devPrefix}[Recnet] Your Weekly Digest for ${formatDate(cutOffDate)}`;
};

export default WeeklyDigest;
