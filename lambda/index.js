const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();
//

exports.handlerLambda = async(event, context, callback) => {
    //event에 s3에 대핸 이벤트가 존재 즉 파일이 들어갔을때 감지하는 event도 있을꺼란 말씀.
    const Bucket = event.Records[0].s3.bucket.name; // s3이름 ubewaugi-s3
    const Key = decodeURIComponent(event.Records[0].s3.object.key); // ex) original/12312312_abc.png
    console.log(Bucket, Key);
    const filename = Key.split('/')[Key.split('/').length - 1];
    const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase();
    const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;
    console.log('filename', filename, 'ext', ext);

    try{
        const s3Object = await s3.getObject({Bucket, Key}).promise();
        console.log('original', s3Object.Body.length);//Body에 바이너리가 저장되어있고, 몇 바이트인지 확인
        const resizedImage = await sharp(s3Object.Body)
        .resize(400,400, {fit: 'inside'})
        .toFormat(requiredFormat)
        .toBuffer();

        await s3.putObject({
            Bucket,
            Key: `thumb/${filename}`,
            Body: resizedImage,
        }).promise();
        console.log('put', resizedImage.length);
        return callback(null, `thumb/${filename}`);
    }catch(error) {
        console.error(error);
        return callback(error);
    }

}