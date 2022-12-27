import axios from 'axios';
import $ from 'cheerio';
import { semester } from '../configs/config';
import { SectionQuota } from './SectionQuota';
import Element = cheerio.Element;
import TagElement = cheerio.TagElement;

type TUstQuotaSiteData = Map<
    string,
    { title: string; sectionQuotas: SectionQuota[] }
>;
// split all handling into different functions
export class UstHelper {
    static readonly semester = semester; // just change this for each semester

    // url depends only on the subject
    static getSubjectUrl(subject: string): string {
        return `https://w5.ab.ust.hk/wcq/cgi-bin/${UstHelper.semester}/subject/${subject}`;
    }

    static async getData(url: string): Promise<TUstQuotaSiteData> {
        // data structure holding the items
        const data: TUstQuotaSiteData = new Map();

        const { data: html } = await axios.get(url);
        const root = $.load(html);
        const courseDivs = root('#classes').children('.course');

        courseDivs.each((i, courseDiv) => {
            const titleDiv = $(courseDiv).find('h2');
            const sectionsDiv = $(courseDiv).find('table.sections');

            if (titleDiv.length === 0) {
                throw new Error("One div doesn't have a title?");
            }

            if (sectionsDiv.length === 0) {
                throw new Error("One div doesn't have sections?");
            }

            const courseTitle = titleDiv
                .text()
                .substring(titleDiv.text().indexOf('-') + 2);
            const courseCode =
                titleDiv.text().match(/^([A-Z]{4} [0-9]{4}[A-Z]?)/)?.[0] ?? '';

            const sectionQuotas: SectionQuota[] = [];

            sectionsDiv.find('tr').each((j, sectionElement) => {
                // unknown div
                if (
                    !((e: Element): e is TagElement => e.type === 'tag')(
                        sectionElement
                    )
                ) {
                    return;
                }

                const sectionClassName = sectionElement.attribs.class;

                // table header row
                if (!sectionClassName) {
                    return;
                }

                // not interested in dateTime/room/instructor
                const isNewSection = sectionClassName
                    .split(' ')
                    .includes('newsect'); // if not, then it is another time for the same section
                if (!isNewSection) {
                    return;
                }

                const rowElements = $(sectionElement).children('td').toArray();
                const sectionText = $(rowElements[0]).text();
                const sectionTextRegexMatch =
                    sectionText.match(/(.+) \(([0-9]+)\)+/) ?? [];
                const [, section, classId] = sectionTextRegexMatch;
                if (section === undefined || classId === undefined) {
                    throw new Error("Cannot parse text on 'section'");
                }

                /**
                 * Sadly, by the time of writing comments, i already forgot what this does.
                 * Probably to deal with the case where when section have major quota, html not the same.
                 */
                const parsetd = (e: Element) => {
                    if ($(e).attr().class === 'quota') {
                        return +($(e)
                            .text()
                            .match(/([0-9]*).*/) ?? [0, 0])[1];
                    }
                    return +$(e).text();
                };

                const sectionQuota = Object.assign<
                    SectionQuota,
                    Partial<SectionQuota>
                >(new SectionQuota(), {
                    semester: UstHelper.semester,
                    courseCode,
                    section,
                    classId: +classId,
                    quota: parsetd(rowElements[4]),
                });
                sectionQuotas.push(sectionQuota);
            });
            data.set(courseCode, { sectionQuotas, title: courseTitle });
        });

        return data;
    }
}
