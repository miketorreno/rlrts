import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TwigProps {
  title: string;
  desc?: string;
  content?: string;
  footer?: string;
}

export default function TwigCard({ title, desc, content, footer }: TwigProps) {
  return (
    <Card className="bg-white w-full max-w-sms">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
        <CardAction>
          <Button variant="link">Edit</Button>
        </CardAction>
      </CardHeader>
      {content && (
        <CardContent>
          <p>{content}</p>
        </CardContent>
      )}
      {footer && (
        <CardFooter>
          <p>{footer}</p>
        </CardFooter>
      )}
    </Card>
  );
}
