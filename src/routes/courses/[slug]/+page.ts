import { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const courseId = params.slug;
  return { courseId };
};
