import React, {ReactNode} from 'react';
import {
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  Text as TextHelper,
  TextInput,
  Dimensions,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
const {width, fontScale} = Dimensions.get('window');

const styleButton = StyleSheet.create({
  btn: {
    width: '100%',
    padding: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    overflow: 'hidden',
    borderRadius: 50,
    padding: 0,
    paddingBottom: 15,
    paddingTop: 15,
    display: 'flex',
    alignItems: 'center',
  },
});

interface DivProps {
  btnPress?: (event: GestureResponderEvent) => void;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  title?: string;
  children?: ReactNode;
  bg?: string;
  bw?: number;
  bc?: string;
  br?: number;
  alc?: boolean;
  center?: boolean;
  flex?: number;
  ml?: number | string | boolean;
  mr?: number | string | boolean;
  mb?: number | string;
  mt?: number | string;
  p?: number;
  pl?: number;
  pr?: number;
  pb?: number;
  pt?: number;
  l?: number;
  r?: number;
  b?: number;
  t?: number;
  o?: number;
  color?: string;
  size?: number;
  width?: string | number;
  height?: string | number;
  maxHeight?: string | number;
  minHeight?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  style?: ViewStyle;
  bold?: boolean;
  upper?: boolean;
  cp?: boolean;
}

export const Button: React.FC<DivProps> = props => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={props.onPress}
      onPressIn={props.onPressIn}
      onPressOut={props.onPressOut}
      style={[
        {position: 'relative'},

        props.ml !== undefined ? ({marginLeft: props.ml} as ViewStyle) : null,
        props.mr !== undefined ? ({marginRight: props.mr} as ViewStyle) : null,
        props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
        props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,

        props.width !== undefined ? ({width: props.width} as ViewStyle) : null,
        ,
        props.height !== undefined
          ? ({height: props.height} as ViewStyle)
          : null,
      ]}>
      <LinearGradient
        colors={['#FA2C37', '#FF6B6B']}
        style={[
          {position: 'relative'},
          props.bw !== undefined ? {borderWidth: props.bw} : null,
          props.br !== undefined ? {borderRadius: props.br} : null,
          {
            shadowColor: '#FA2C37',
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 10,
          },
        ]}>
        <TextHelper
          style={[
            {position: 'relative'},
            props.bold !== undefined ? {fontWeight: 'bold'} : null,
            props.p !== undefined ? {padding: props.p} : null,
            props.pl !== undefined ? {paddingLeft: props.pl} : null,
            props.pr !== undefined ? {paddingRight: props.pr} : null,
            props.pb !== undefined ? {paddingBottom: props.pb} : null,
            props.pt !== undefined ? {paddingTop: props.pt} : null,
            props.color !== undefined ? {color: props.color} : {color: '#000'},
            props.center !== undefined ? {textAlign: 'center'} : null,
            props.upper !== undefined ? {textTransform: 'uppercase'} : null,
            props.cp !== undefined ? {textTransform: 'capitalize'} : null,
          ]}>
          {props.title}
        </TextHelper>
      </LinearGradient>
    </TouchableOpacity>
  );
};
export const Div: React.FC<DivProps> = props => {
  const {
    children,
    bg,
    bw,
    bc,
    br,
    alc,
    center,
    flex,
    ml,
    mr,
    mb,
    mt,
    p,
    pl,
    pr,
    pb,
    pt,
    l,
    r,
    b,
    t,
    o,
    width,
    height,
    maxHeight,
    minHeight,
    minWidth,
    maxWidth,
    style,
  } = props;

  const customStyle = {
    position: 'relative' as const,
    ...(bg !== undefined && {backgroundColor: bg}),
    ...(bw !== undefined && {borderWidth: bw}),
    ...(bc !== undefined && {borderColor: bc}),
    ...(br !== undefined && {borderRadius: br}),
    ...(alc !== undefined && {alignItems: 'center' as const}),
    ...(center !== undefined && {justifyContent: 'center' as const}),
    ...(flex !== undefined && {flex}),
    ...(ml !== undefined && {marginLeft: ml}),
    ...(mr !== undefined && {marginRight: mr}),
    ...(mb !== undefined && {marginBottom: mb}),
    ...(mt !== undefined && {marginTop: mt}),
    ...(p !== undefined && {padding: p}),
    ...(pl !== undefined && {paddingLeft: pl}),
    ...(pr !== undefined && {paddingRight: pr}),
    ...(pb !== undefined && {paddingBottom: pb}),
    ...(pt !== undefined && {paddingTop: pt}),
    ...(l !== undefined && {left: l}),
    ...(r !== undefined && {right: r}),
    ...(b !== undefined && {bottom: b}),
    ...(t !== undefined && {top: t}),
    ...(o !== undefined && {borderRadius: o}),
    ...(width !== undefined && {width}),
    ...(height !== undefined && {height}),
    ...(maxHeight !== undefined && {maxHeight}),
    ...(minHeight !== undefined && {minHeight}),
    ...(minWidth !== undefined && {minWidth}),
    ...(maxWidth !== undefined && {maxWidth}),
  };

  return <View style={[customStyle as any, style]}>{children}</View>;
};
// export const Div: React.FC<DivProps> = props => {
//   return (
//     <View
//       style={[
//         {position: 'relative'},
//         props.bg !== undefined ? {backgroundColor: props.bg} : null,
//         props.bw !== undefined ? {borderWidth: props.bw} : null,
//         props.bc !== undefined ? {borderColor: props.bc} : null,
//         props.br !== undefined ? {borderRadius: props.br} : null,
//         props.alc !== undefined ? {alignItems: 'center'} : null,
//         props.center !== undefined ? {justifyContent: 'center'} : null,
//         props.flex !== undefined ? {flex: props.flex} : null,

//         props.ml !== undefined ? ({marginLeft: props.ml} as ViewStyle) : null,
//         props.mr !== undefined ? ({marginRight: props.mr} as ViewStyle) : null,
//         props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
//         props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,

//         props.p !== undefined ? {padding: props.p} : null,
//         props.pl !== undefined ? {paddingLeft: props.pl} : null,
//         props.pr !== undefined ? {paddingRight: props.pr} : null,
//         props.pb !== undefined ? {paddingBottom: props.pb} : null,
//         props.pt !== undefined ? {paddingTop: props.pt} : null,

//         props.l !== undefined ? {left: props.l} : null,
//         props.r !== undefined ? {right: props.r} : null,
//         props.b !== undefined ? {bottom: props.b} : null,
//         props.t !== undefined ? {top: props.t} : null,
//         props.o !== undefined ? {borderRadius: props.o} : null,

//         props.width !== undefined ? ({width: props.width} as ViewStyle) : null,
//         ,
//         props.height !== undefined
//           ? ({height: props.height} as ViewStyle)
//           : null,

//         ,
//         props.maxHeight !== undefined
//           ? ({maxHeight: props.maxHeight} as ViewStyle)
//           : null,
//         ,
//         props.minHeight !== undefined
//           ? ({minHeight: props.minHeight} as ViewStyle)
//           : null,

//         ,
//         props.minWidth !== undefined
//           ? ({minWidth: props.minWidth} as ViewStyle)
//           : null,
//         props.maxWidth !== undefined
//           ? ({maxWidth: props.maxWidth} as ViewStyle)
//           : null,

//         props.style,
//       ]}>
//       {props.children}
//     </View>
//   );
// };
interface TouchProps extends DivProps {
  onPress?: () => void;
  e?: number;
  row?: boolean;
}

export const Touch: React.FC<TouchProps> = props => {
  return (
    <TouchableOpacity
      {...props}
      onPress={props.onPress}
      style={[
        {position: 'relative'},
        props.bg !== undefined ? {backgroundColor: props.bg} : null,
        props.bw !== undefined ? {borderWidth: props.bw} : null,
        props.bc !== undefined ? {borderColor: props.bc} : null,
        props.br !== undefined ? {borderRadius: props.br} : null,
        props.center !== undefined ? {justifyContent: 'center'} : null,
        props.alc !== undefined ? {alignItems: 'center'} : null,
        props.flex !== undefined ? {flex: props.flex} : null,
        props.e !== undefined ? {elevation: props.e} : null,
        props.row !== undefined ? {flexDirection: 'row'} : null,

        props.ml !== undefined ? ({marginLeft: props.ml} as ViewStyle) : null,
        props.mr !== undefined ? ({marginRight: props.mr} as ViewStyle) : null,
        props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
        props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,

        props.p !== undefined ? {padding: props.p} : null,
        props.pl !== undefined ? {paddingLeft: props.pl} : null,
        props.pr !== undefined ? {paddingRight: props.pr} : null,
        props.pb !== undefined ? {paddingBottom: props.pb} : null,
        props.pt !== undefined ? {paddingTop: props.pt} : null,

        props.l !== undefined ? {left: props.l} : null,
        props.r !== undefined ? {right: props.r} : null,
        props.b !== undefined ? {bottom: props.b} : null,
        props.t !== undefined ? {top: props.t} : null,

        props.o !== undefined ? {borderRadius: props.o} : null,

        props.width !== undefined ? ({width: props.width} as ViewStyle) : null,
        ,
        props.height !== undefined
          ? ({height: props.height} as ViewStyle)
          : null,

        ,
        props.maxHeight !== undefined
          ? ({maxHeight: props.maxHeight} as ViewStyle)
          : null,
        ,
        props.minHeight !== undefined
          ? ({minHeight: props.minHeight} as ViewStyle)
          : null,

        ,
        props.minWidth !== undefined
          ? ({minWidth: props.minWidth} as ViewStyle)
          : null,
        props.maxWidth !== undefined
          ? ({maxWidth: props.maxWidth} as ViewStyle)
          : null,

        props.style,
      ]}>
      {props.children}
    </TouchableOpacity>
  );
};

interface TextProps {
  children?: ReactNode;
  color?: string;
  bg?: string;
  size?: number;
  fa?: boolean;
  fr?: boolean;
  fo?: boolean;
  br?: number;
  center?: boolean;
  right?: boolean;
  js?: boolean;
  ml?: number | string;
  mr?: number | string;
  mb?: number | string;
  mt?: number | string;
  pl?: number;
  pr?: number;
  pb?: number;
  pt?: number;
  l?: number;
  s?: number;
  r?: number;
  width?: string | number;
  upper?: boolean;
  cp?: boolean;
  bold?: boolean;
  b?: number;
  t?: number;
  ul?: boolean;
  style?: TextStyle;
  line?: number;
}

export const Text: React.FC<TextProps> = props => {
  return (
    <TextHelper
      style={[
        props.color !== undefined ? {color: props.color} : {color: '#000'},
        props.bg !== undefined ? {backgroundColor: props.bg} : null,
        props.size !== undefined
          ? {fontSize: props.size / fontScale}
          : {fontSize: 14 / fontScale},
        props.fa !== undefined ? {fontFamily: 'AlegreyaSans-Italic'} : null,
        props.fr !== undefined ? {fontFamily: 'Lato-Regular'} : null,
        props.fo !== undefined
          ? {fontFamily: 'Oswald-VariableFont_wght'}
          : null,
        props.br !== undefined ? {borderRadius: props.br} : null,
        props.center !== undefined ? {textAlign: 'center'} : null,
        props.right !== undefined ? {textAlign: 'right'} : null,
        props.js !== undefined ? {textAlign: 'justify'} : null,
        props.ml !== undefined ? ({marginLeft: props.ml} as ViewStyle) : null,
        props.mr !== undefined ? ({marginRight: props.mr} as ViewStyle) : null,
        props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
        props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,
        props.pl !== undefined ? {paddingLeft: props.pl} : null,
        props.pr !== undefined ? {paddingRight: props.pr} : null,
        props.pb !== undefined ? {paddingBottom: props.pb} : null,
        props.pt !== undefined ? {paddingTop: props.pt} : null,
        props.l !== undefined ? {lineHeight: props.l} : null,
        props.s !== undefined ? {letterSpacing: props.s} : null,
        props.width !== undefined ? ({width: props.width} as ViewStyle) : null,
        props.upper !== undefined ? {textTransform: 'uppercase'} : null,
        props.cp !== undefined ? {textTransform: 'capitalize'} : null,
        props.bold !== undefined ? {fontWeight: 'bold'} : null,
        {position: 'relative'},
        props.l !== undefined ? {left: props.l} : null,
        props.r !== undefined ? {right: props.r} : null,
        props.b !== undefined ? {bottom: props.b} : null,
        props.t !== undefined ? {top: props.t} : null,
        props.ul !== undefined ? {textDecorationLine: 'underline'} : null,
        props.style,
      ]}
      numberOfLines={props.line !== undefined ? props.line : undefined}>
      {props.children}
    </TextHelper>
  );
};

interface FlexProps extends DivProps {
  children?: ReactNode;
  gap?: number;
  column?: boolean;
  middle?: boolean;
  bottom?: boolean;
  baseline?: boolean;
  stretch?: boolean;
  spaceb?: boolean;
  spacea?: boolean;
  end?: boolean;
  right?: boolean;
  cover?: boolean;
  full?: boolean;
  wrap?: boolean;
}

export const Flex: React.FC<FlexProps> = props => {
  return (
    <View
      style={[
        {
          width:
            props.size !== undefined ? props.size : ('auto' as string | number),
          display: 'flex',
          position: 'relative',
        } as ViewStyle,

        props.bw !== undefined ? {borderWidth: props.bw} : null,
        props.bc !== undefined ? {borderColor: props.bc} : null,
        props.br !== undefined ? {borderRadius: props.br} : null,
        props.bg !== undefined ? {backgroundColor: props.bg} : null,
        props.flex !== undefined ? {flex: props.flex} : null,
        props.gap !== undefined ? {gap: props.gap} : null,

        props.height !== undefined
          ? ({height: props.height} as ViewStyle)
          : null,

        props.column !== undefined
          ? {flexDirection: 'column'}
          : {flexDirection: 'row'},
        props.middle !== undefined ? {alignItems: 'center'} : '',
        props.bottom !== undefined ? {alignItems: 'flex-end'} : '',
        props.baseline !== undefined ? {alignItems: 'baseline'} : '',
        props.stretch !== undefined ? {alignItems: 'stretch'} : '',
        props.spaceb !== undefined ? {justifyContent: 'space-between'} : '',
        props.spacea !== undefined ? {justifyContent: 'space-around'} : '',
        props.end !== undefined ? {justifyContent: 'flex-end'} : '',
        props.center !== undefined ? {justifyContent: 'center'} : '',
        props.right !== undefined ? {justifyContent: 'flex-end'} : '',
        // props.cover !== undefined ? {minHeight: screen.h('97%')} : '',
        // props.full !== undefined ? {minHeight: screen.h('91%')} : '',

        props.ml !== undefined ? ({marginLeft: props.ml} as ViewStyle) : null,
        props.mr !== undefined ? ({marginRight: props.mr} as ViewStyle) : null,
        props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
        props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,

        props.l !== undefined ? {left: props.l} : null,
        props.r !== undefined ? {right: props.r} : null,
        props.b !== undefined ? {bottom: props.b} : null,
        props.t !== undefined ? {top: props.t} : null,

        props.wrap !== undefined ? {flexWrap: 'wrap'} : null,

        props.width !== undefined ? ({width: props.width} as ViewStyle) : null,
        props.minWidth !== undefined
          ? ({minWidth: props.minWidth} as ViewStyle)
          : null,
        props.maxWidth !== undefined
          ? ({maxWidth: props.maxWidth} as ViewStyle)
          : {maxWidth: '100%'},

        {padding: 10},
        props.p !== undefined ? {padding: props.p} : null,

        props.o !== undefined ? {borderRadius: props.o} : null,

        props.pl !== undefined ? {paddingLeft: props.pl} : null,
        props.pr !== undefined ? {paddingRight: props.pr} : null,
        props.pb !== undefined ? {paddingBottom: props.pb} : null,
        props.pt !== undefined ? {paddingTop: props.pt} : null,

        props.style !== undefined ? props.style : null,
      ]}>
      {props.children}
    </View>
  );
};

interface ContainerProps extends DivProps {}

export const Container: React.FC<ContainerProps> = props => {
  return (
    <View
      style={[
        {position: 'relative'},
        props.bg !== undefined ? {backgroundColor: props.bg} : null,
        props.bw !== undefined ? {borderWidth: props.bw} : null,
        props.bc !== undefined ? {borderColor: props.bc} : null,
        props.br !== undefined ? {borderRadius: props.br} : null,
        props.center !== undefined ? {justifyContent: 'center'} : null,
        props.alc !== undefined ? {alignItems: 'center'} : null,
        props.flex !== undefined ? {flex: props.flex} : null,

        props.ml !== undefined ? {marginLeft: 'auto'} : null,
        props.mr !== undefined ? {marginRight: 'auto'} : null,
        props.mb !== undefined ? ({marginBottom: props.mb} as ViewStyle) : null,
        props.mt !== undefined ? ({marginTop: props.mt} as ViewStyle) : null,

        props.p !== undefined ? {padding: props.p} : null,
        props.pl !== undefined ? {paddingLeft: props.pl} : null,
        props.pr !== undefined ? {paddingRight: props.pr} : null,
        props.pb !== undefined ? {paddingBottom: props.pb} : null,
        props.pt !== undefined ? {paddingTop: props.pt} : null,

        props.l !== undefined ? {left: props.l} : null,
        props.r !== undefined ? {right: props.r} : null,
        props.b !== undefined ? {bottom: props.b} : null,
        props.t !== undefined ? {top: props.t} : null,

        props.o !== undefined ? {borderRadius: props.o} : null,

        props.width !== undefined
          ? ({width: props.width} as ViewStyle)
          : {width: '95%'},
        props.height !== undefined
          ? ({height: props.height} as ViewStyle)
          : null,

        props.maxHeight !== undefined
          ? ({maxWidth: props.maxHeight} as ViewStyle)
          : null,
        props.minHeight !== undefined
          ? ({minHeight: props.minHeight} as ViewStyle)
          : null,

        props.style,
      ]}>
      {props.children}
    </View>
  );
};

interface GradientProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export const Gradient: React.FC<GradientProps> = props => {
  const {theme} = useSelector((state: any) => state.theme);

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      locations={[0.3, 1, 1, 0.1]}
      end={{x: 1, y: 0.4}}
      colors={[
        theme.gradBG.dark,
        theme.gradBG.dark,
        theme.gradBG.dark,
        theme.gradBG.dark,
      ]}
      style={[{flex: 1}, {...props.style}]}>
      {props.children}
    </LinearGradient>
  );
};

export const GradientRed: React.FC<GradientProps> = props => {
  return (
    <LinearGradient
      start={{x: 0, y: 0.4}}
      locations={[0, 0.9]}
      end={{x: 0.8, y: 0.1}}
      colors={['red', '#fff']}
      style={[props.style]}>
      {props.children}
    </LinearGradient>
  );
};

const UI = {
  Div,
  Text,
  Flex,
  Gradient,
  GradientRed,
  Container,
};

export default UI;
