export default function pipeInput(): Promise<string> {
    const stdin = process.stdin;
    return new Promise((resolve, reject) => {
        let data = '';

        stdin.setEncoding('utf8');

        stdin.on('data', function (chunk) {
            data += chunk;
        });

        stdin.on('end', function () {
            resolve(data);
        });

        stdin.on('error', reject);
    });
}
