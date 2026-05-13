import { TextInput, Text } from "react-native";

interface TextInputCustomProps {
  placeholder: string;
  caption: string;
  onChangeText: (text: string) => void;
  isNumeric?: boolean;
  currentValue?: string;
}

export default function TextInputCustom(props: TextInputCustomProps) {
  return (
    <>
      <Text>
        {props.caption} : {props.currentValue}
      </Text>
      <TextInput
        placeholder={props.placeholder}
        onChangeText={props.onChangeText}
        keyboardType={props.isNumeric ? "numeric" : "default"}
      />
    </>
  );
}
