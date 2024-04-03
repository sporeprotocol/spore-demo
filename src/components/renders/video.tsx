import { QuerySpore } from "@/hooks/query/type";
import { BI } from "@ckb-lumos/lumos";
import { AspectRatio, Box, Image, createStyles, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";
import { object } from "zod";

export interface ImageSporeRenderProps {
  spore: QuerySpore;
  ratio?: number;
  size?: "sm" | "md" | "lg";
}

const useStyles = createStyles((_, params?: { pixelated: boolean }) => ({
  image: {
    imageRendering: params?.pixelated ? "pixelated" : "auto",
  },
  figure: {
    width: "100%",
  },
}));

export function VideoSporeCoverRender(props: ImageSporeRenderProps) {
  const { spore, ratio = 1 } = props;
  const capacity = useMemo(() => BI.from(spore.cell?.cellOutput.capacity ?? 0).toNumber(), [spore]);
  const { classes } = useStyles({ pixelated: capacity < 10_000 * 10 ** 8 });

  return (
    <AspectRatio ratio={ratio} bg="#F4F5F9">
      {/* <Image
        alt={spore.id!}
        src={`/api/media/${spore.id}`}
        classNames={{
          image: classes.image,
          figure: classes.figure,
        }}
      /> */}
      <video className="w-full" autoPlay loop muted>
        <source src={`/api/media/${spore.id}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </AspectRatio>
  );
}

export const VideoSporeContentRender = VideoSporeCoverRender;

export interface ImagePreviewRenderProps {
  content: Blob;
}

const usePreviewStyles = createStyles((theme, params?: { pixelated: boolean }) => ({
  container: {
    borderColor: theme.colors.text[0],
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "6px",
    backgroundColor: theme.colors.background[1],
  },
  image: {
    width: "616px",
    height: "260px",
    imageRendering: params?.pixelated ? "pixelated" : "auto",

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      width: "auto",
    },
  },
}));

export function VideoPreviewRender(props: ImagePreviewRenderProps) {
  const { content } = props;
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [dataUrl, setDataUrl] = useState<string | ArrayBuffer | null>(null);
  const { classes } = usePreviewStyles({
    pixelated: (content?.size ?? 0) < 10_000,
  });

  useEffect(() => {
    const reader = new window.FileReader();
    reader.readAsDataURL(content);
    reader.onloadend = () => {
      setDataUrl(reader.result);
    };
  }, [content]);

  if (!dataUrl) {
    return null;
  }

  return (
    <Box className={classes.container}>
      <AspectRatio ratio={(isMobile ? 295 : 616) / 260}>
        {/* <Image
          width="100%"
          height="260px"
          className={classes.image}
          src={dataUrl.toString()}
          alt="preview"
          fit="contain"
        /> */}
        <video className="w-content h-[260px] !object-none" style={{ objectFit: "contain" }} autoPlay loop muted>
          <source src={`${dataUrl.toString()}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </AspectRatio>
    </Box>
  );
}
