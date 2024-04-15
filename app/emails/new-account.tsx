import { Heading, Hr, Html, Text } from '@react-email/components';

type NewAccountProps = {
  name: string;
};

export default function NewAccount({ name }: NewAccountProps) {
  return (
    <Html>
      <Heading>Hello {name || 'there'}!</Heading>
      <Text>Your new account has been created!</Text>
      <Hr />
      <Text style={{ color: '#aaa' }}>Financial Goals app</Text>
    </Html>
  );
}

const previewProps: NewAccountProps = {
  name: 'Test',
};
NewAccount.PreviewProps = previewProps;
