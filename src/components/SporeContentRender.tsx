import "react-loading-skeleton/dist/skeleton.css";
import { Box, Group, createStyles } from "@mantine/core";
import { ImageSporeContentRender } from "./renders/image";
import { isImageMIMEType, isTextMIMEType, isVideoMIMEType } from "@/utils/mime";
import { TextSporeContentRender } from "./renders/text";
import { VideoSporeContentRender } from "./renders/video";
import { QuerySpore } from "@/hooks/query/type";

const useStyles = createStyles((theme) => ({
  image: {
    width: "100%",
    height: "100%",
    maxWidth: "468px",
    maxWeight: "468px",
    borderRadius: "8px",
    borderColor: theme.colors.text[0],
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: "4px 4px 0 #111318",
    backgroundColor: theme.colors.background[1],
    overflow: "hidden",

    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
}));

export default function SporeContentRender({ spore }: { spore: QuerySpore | undefined }) {
  const { classes } = useStyles();

  if (!spore) {
    return null;
  }

  if (isImageMIMEType(spore!.contentType)) {
    return (
      <Group position="center">
        <Box className={classes.image}>
          <ImageSporeContentRender spore={spore} />
        </Box>
      </Group>
    );
  }
  if (isVideoMIMEType(spore!.contentType)) {
    return (
      <Group position="center">
        <Box className={classes.image}>
          <VideoSporeContentRender spore={spore} />
        </Box>
      </Group>
    );
  }

  if (isTextMIMEType(spore!.contentType)) {
    return <TextSporeContentRender spore={spore} />;
  }

  return null;
}
