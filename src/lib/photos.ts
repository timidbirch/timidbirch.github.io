import type { ImageMetadata } from 'astro'
import type { PhotoData, Photo, PolaroidVariant } from '~/types'

// Auto-import all images under the photos directory.
const photoModules = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/**/*.{webp,jpg,jpeg,png}', { eager: true })

/**
 * Get a sorted list of photos by directory name.
 * @param dir - Directory name, for example '2025-06-21-cat'
 * @param alt - Image alt text
 * @param variants - Variant for each image, mapped by index
 */
type LocalPhoto = Photo & { src: ImageMetadata }

function getPhotos(dir: string, alt: string, variants: PolaroidVariant[]): LocalPhoto[] {
  return Object.entries(photoModules)
    .filter(([path]) => path.includes(`/${dir}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod], index) => {
      const img = mod.default
      return {
        src: img,
        alt,
        width: img.width,
        height: img.height,
        variant: variants[index] || '4x3',
      }
    })
}

const photosList: (Omit<PhotoData, 'photos'> & { photos: LocalPhoto[] })[] = [
  {
    id: 'botanical-garden',
    title: 'Ningbo · Botanical Garden',
    titleZh: '宁波 · 植物园',
    icon: { type: 'emoji', value: '🌼' },
    description: 'It was early spring, so I went to see the cherry blossoms.',
    descriptionZh: '初春，去植物园看樱花。',
    date: '2026-03-07',
    travel: '',
    photos: getPhotos('2026-03-07-botanicalGarden', 'Early spring cherry blossoms at the botanical garden', [
      '3x4',
      '3x4',
      '3x4',
      '3x4',
      '3x4',
      '3x4',
    ]),
  },
  {
    id: 'hometown',
    title: 'Around Home',
    titleZh: '家乡随拍',
    icon: { type: 'emoji', value: '🖼️' },
    description: 'I went home for the holiday, wandered around a bit, and enjoyed the comfort of home.',
    descriptionZh: '假期回家，在熟悉的地方随便走了走。',
    date: '2026-02-20',
    travel: '',
    photos: getPhotos('2026-02-20-hometown', 'A relaxed walk around home', ['4x3', '4x3', '4x3', '4x3', '4x3', '4x3']),
  },
  {
    id: 'classmate',
    title: 'Ningbo · Day Out with a Classmate',
    titleZh: '宁波 · 和同学出去玩',
    icon: { type: 'emoji', value: '🎲' },
    description:
      'A classmate came to Ningbo for the weekend. We visited our old school and a board game cafe. I loved the butterfly specimens there, and even though I do not usually play board games, Salem 1692 was especially fun. We talked a lot and had a great time.',
    descriptionZh:
      '同学周末来宁波。我们回了趟母校，又去了桌游店。我很喜欢店里的蝴蝶标本，平时很少玩桌游，但那天的《塞勒姆 1692》特别有意思。我们聊了很多，玩得很开心。',
    date: '2026-01-10',
    travel: '',
    photos: getPhotos('2026-01-10-classmate', 'A day out in Ningbo with a classmate', ['4x5', '4x5', '4x5', '4x5']),
  },
  {
    id: 'dazz',
    title: 'Dazz App',
    titleZh: 'Dazz 随拍',
    icon: { type: 'emoji', value: '🏙️' },
    description: 'I took a few photos with the Dazz camera app, and the results were pretty good.',
    descriptionZh: '用 Dazz 相机拍了几张，效果还不错。',
    date: '2025-12-11',
    travel: '',
    photos: getPhotos('2025-12-11-dazz', 'Dazz App', ['4x3', '4x3']),
  },
  {
    id: 'cat',
    title: "A Cute Cat at a Friend's Place",
    titleZh: '朋友家的猫',
    icon: { type: 'emoji', value: '🐈' },
    description: 'Way too adorable (*^ω^*). Truly an excellent cat.',
    descriptionZh: '太可爱了 (*^ω^*)，真是一只好猫。',
    date: '2025-06-21',
    travel: '',
    photos: getPhotos('2025-06-21-cat', "A cute cat at a friend's place", ['4x3', '4x3', '4x3', '4x3', '4x3', '4x3']),
  },
  {
    id: 'dongqian-lake',
    title: 'Ningbo · Dongqian Lake',
    titleZh: '宁波 · 东钱湖',
    icon: { type: 'emoji', value: '🚴' },
    description: 'I biked around Dongqian Lake. My legs cramped a few times, but the scenery was beautiful.',
    descriptionZh: '骑车绕了东钱湖一圈。腿抽筋了好几次，风景很好看。',
    date: '2025-03-01',
    travel: '',
    photos: getPhotos('2025-03-01-dongqianhu', 'Ningbo · Dongqian Lake', ['4x5', '1x1', '4x3']),
  },
  {
    id: 'zhoushan',
    title: 'Ningbo · Zhoushan',
    titleZh: '舟山',
    icon: { type: 'emoji', value: '🏞️' },
    description: '',
    date: '2024-09-07',
    travel: '',
    photos: getPhotos('2024-09-07-zhoushan', 'Ningbo · Zhoushan', ['4x3', '4x3']),
  },
]

export const photoAlbums = photosList.filter((album) => album.photos.length > 0).sort((a, b) => b.date.localeCompare(a.date))
