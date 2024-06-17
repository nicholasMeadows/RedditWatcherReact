import { v4 as uuidV4 } from "uuid";
import { Attachment } from "../Post/Attachment";
import { Post } from "../Post/Post";
import { T3 } from "../RedditApiResponse/Types/T3/T3";
import { Subreddit } from "../Subreddit/Subreddit";
import { SubredditLists } from "../SubredditList/SubredditLists.ts";
import { AttachmentResolution } from "../Post/AttachmentResolution.ts";

const DOMAIN_REDGIFS = "redgifs.com";
const DOMAIN_IMGUR1 = "i.imgur.com";
const DOMAIN_IMGUR2 = "imgur.com";
const DOMAIN_GIPHY = "giphy.com";
const DOMAIN_REDDIT = "i.redd.it";
const DOMAIN_REDDIT2 = "redd.it";
const DOMAIN_REDDIT3 = "www.reddit.com";
const DOMAIN_REDDIT4 = "reddit.com";

const ALLOWED_DOMAINS = [
  DOMAIN_REDGIFS,
  DOMAIN_IMGUR1,
  DOMAIN_IMGUR2,
  DOMAIN_GIPHY,
  DOMAIN_REDDIT,
  DOMAIN_REDDIT2,
  DOMAIN_REDDIT3,
  DOMAIN_REDDIT4,
];

export function convertPost(
  post: T3,
  masterSubscribedSubredditList: Array<Subreddit>,
  subredditLists: Array<SubredditLists>
): Post {
  const subredditDisplayName = post.subreddit;

  let fromList = "";
  subredditLists.forEach((list) => {
    const foundSubreddit = list.subreddits.find(
      (subreddit) => subreddit.displayName == subredditDisplayName
    );
    if (foundSubreddit != undefined && !fromList.includes(list.listName)) {
      fromList += list.listName + ", ";
    }
  });

  fromList = fromList.trim();
  if (fromList.endsWith(",")) {
    fromList = fromList.substring(0, fromList.length - 1);
  }
  const subreddit: Subreddit = {
    displayName: subredditDisplayName,
    displayNamePrefixed: post.subreddit_name_prefixed,
    subscribers: post.subreddit_subscribers,
    over18: post.over_18,
    isSubscribed:
      masterSubscribedSubredditList.find(
        (sub) =>
          sub.displayName.toLowerCase() == subredditDisplayName.toLowerCase()
      ) != undefined,
    fromList: fromList,
    subredditUuid: uuidV4(),
    isUser: post.subreddit_name_prefixed.startsWith("u_"),
  };
  return {
    subreddit: subreddit,
    postUuid: uuidV4(),
    created: post.created,
    postId: post.name,
    over18: post.over_18,
    domain: post.domain,
    url: post.url,
    attachments: createAttachments(post),
    permaLink: post.permalink,
    randomSourceString: "",
    currentAttachmentIndex: 0,
    thumbnail: post.thumbnail,
  };
}

function createAttachments(post: T3): Array<Attachment> {
  let postUrl: string = post.url;
  const domain: string = post.domain;

  if (
    ALLOWED_DOMAINS.includes(domain) &&
    !(
      (DOMAIN_IMGUR1 == domain || DOMAIN_IMGUR2 == domain) &&
      postUrl.includes("/a/")
    )
  ) {
    if (
      (DOMAIN_REDDIT3 == domain || DOMAIN_REDDIT4 == domain) &&
      postUrl.includes("/gallery")
    ) {
      const galleryAttachments = convertMediaMetadata(post);

      if (galleryAttachments != null && galleryAttachments.length > 0) {
        const processedAttachments = new Array<Attachment>();
        galleryAttachments.forEach((attachment) => {
          if (attachment.status == "valid") {
            const attachmentUrl = attachment.url;
            let formattedUrl = attachmentUrl;
            if (formattedUrl.startsWith("https://preview.redd.it")) {
              formattedUrl = attachmentUrl.replace(
                "https://preview.redd.it",
                "https://i.redd.it"
              );
            }

            if (formattedUrl.startsWith("https://redd.it")) {
              formattedUrl = attachmentUrl.replace(
                "https://redd.it",
                "https://i.redd.it"
              );
            }

            const attachmentBaseUrl = formattedUrl.split("?")[0];
            attachment.url = attachmentBaseUrl;
            attachment.mediaType = "IMAGE";
            processedAttachments.push(attachment);
          }
        });

        if (processedAttachments.length > 0) {
          return processedAttachments;
        }
      }
    } else {
      const attachments = new Array<Attachment>();
      let attachment: Attachment | undefined;

      const attachmentResolutions = new Array<AttachmentResolution>();
      if (
        post.preview !== undefined &&
        post.preview.images !== undefined &&
        post.preview.images.length > 0
      ) {
        const previewImage = post.preview.images[0];
        const mappedResolutions: Array<AttachmentResolution> =
          previewImage.resolutions.map((resolution) => {
            return {
              url: resolution.url,
              width: resolution.width,
              height: resolution.height,
            };
          });
        attachmentResolutions.push(...mappedResolutions);
      }
      const baseUrl = postUrl.split("?")[0];
      if (
        baseUrl.endsWith(".jpg") ||
        baseUrl.endsWith(".jpeg") ||
        baseUrl.endsWith(".png")
      ) {
        attachment = {
          mediaType: "IMAGE",
          url: postUrl,
          status: "VALID",
          attachmentResolutions: attachmentResolutions,
        };
        attachments.push(attachment);
      } else if (baseUrl.endsWith(".gif")) {
        attachment = {
          mediaType: "GIF",
          url: postUrl,
          status: "VALID",
          attachmentResolutions: attachmentResolutions,
        };
        attachments.push(attachment);
      } else if (domain == DOMAIN_GIPHY) {
        attachment = {
          mediaType: "IFRAME",
          url: postUrl,
          status: "VALID",
          attachmentResolutions: attachmentResolutions,
        };
        attachments.push(attachment);
      } else if (
        (domain == DOMAIN_IMGUR1 || domain == DOMAIN_IMGUR2) &&
        postUrl == ".gifv"
      ) {
        attachment = {
          mediaType: "VIDEO-MP4",
          url: postUrl.substring(0, postUrl.length - 5) + ".mp4",
          status: "VALID",
          attachmentResolutions: attachmentResolutions,
        };
        attachments.push(attachment);
      }
      // else if (domain == DOMAIN_REDGIFS) {
      //   if (postUrl.startsWith("https://redgifs.com")) {
      //     postUrl = postUrl.replace(
      //       "https://redgifs.com",
      //       "https://www.redgifs.com"
      //     );
      //   }
      //
      //   postUrl = postUrl.replace(
      //     "https://www.redgifs.com/watch/",
      //     "https://redgifs.com/ifr/"
      //   );
      //
      //   attachment = {
      //     mediaType: "IFRAME",
      //     url: postUrl,
      //     status: "VALID",
      //   };
      //   attachments.push(attachment);
      // }
      return attachments;
    }
  }
  return [];
}

function convertMediaMetadata(post: T3): Array<Attachment> {
  const attachments = new Array<Attachment>();

  const mediaMetadata = post.media_metadata;

  if (mediaMetadata != null) {
    Object.keys(mediaMetadata).forEach((key) => {
      const mediaMetadataObj = mediaMetadata[key];
      if (mediaMetadataObj != undefined) {
        const mediaType = mediaMetadataObj.m;
        const mediaMetadataItem = mediaMetadataObj.s;
        const mediaMetadataResolutions = mediaMetadataObj.p;

        let url: string | undefined = undefined;
        if (mediaType != null && mediaMetadataItem != null) {
          if (mediaType == "image/png" || mediaType == "image/jpg") {
            url = mediaMetadataItem.u;
          } else if (mediaType == "image/gif") {
            url = mediaMetadataItem.gif;
          }
        }

        const attachmentResolutions = new Array<AttachmentResolution>();
        if (mediaMetadataResolutions !== undefined) {
          const resoltions = mediaMetadataResolutions.map(
            (mediaMetadataResolution) => {
              return {
                url: mediaMetadataResolution.u,
                width: mediaMetadataResolution.x,
                height: mediaMetadataResolution.y,
              };
            }
          );
          attachmentResolutions.push(...resoltions);
        }

        if (url != null) {
          const attachment: Attachment = {
            status: mediaMetadataObj.status,
            url: url,
            mediaType: mediaType,
            attachmentResolutions: attachmentResolutions,
          };
          attachments.push(attachment);
        }
      }
    });
  } else {
    const crossPostParents = post.crosspost_parent_list;
    if (crossPostParents != null && crossPostParents.length > 0) {
      const crossPostParent = crossPostParents[0];
      const crossPostAttachments = convertMediaMetadata(crossPostParent);
      attachments.push(...crossPostAttachments);
    }
  }

  return attachments;
}
