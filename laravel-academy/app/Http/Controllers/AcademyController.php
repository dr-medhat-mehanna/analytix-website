<?php
namespace App\Http\Controllers;

class AcademyController extends Controller
{
    private $basePath = '/academy/data';

    private function loadJson(string $path): ?array
    {
        if (!file_exists($path)) return null;
        return json_decode(file_get_contents($path), true);
    }

    private function getJsonPath(string $type, string $id): ?string
    {
        $map = [
            'ias'      => "standards/ias/{$id}.json",
            'ifrs'     => "standards/ifrs/{$id}.json",
            'sox'      => "standards/sox/{$id}.json",
            'coso'     => "standards/coso/{$id}.json",
            'cfo'      => "cfo-tasks/{$id}.json",
            'controls' => "internal-controls/{$id}.json",
            'articles' => "articles/{$id}.json",
            'featured' => "articles/{$id}.json",
            'books'    => "books/{$id}.json",
        ];
        if (!isset($map[$type])) return null;
        return $this->basePath . '/' . $map[$type];
    }

    public function index()
    {
        return view('academy.index');
    }

    public function article(string $type, string $id)
    {
        $path = $this->getJsonPath($type, $id);
        if (!$path) abort(404);
        $data = $this->loadJson($path);
        if (!$data) abort(404);
        $title = $data['title'] ?? 'اكاديمية Analytix';
        $desc  = $data['meta']['description'] ?? $data['content']['summary'] ?? '';
        $url   = "https://analytix.finance/academy/{$type}/{$id}/";
        $img   = 'https://analytix.finance/academy/assets/og-academy.png';
        return view('academy.article', compact('data','type','id','title','desc','url','img'));
    }

    public function sitemap()
    {
        $urls = [];
        $types = [
            'ias'=>'standards/ias','ifrs'=>'standards/ifrs',
            'sox'=>'standards/sox','coso'=>'standards/coso',
            'cfo'=>'cfo-tasks','controls'=>'internal-controls',
            'articles'=>'articles','books'=>'books',
        ];
        foreach ($types as $type => $dir) {
            $fullDir = $this->basePath . '/' . $dir;
            if (!is_dir($fullDir)) continue;
            foreach (glob($fullDir . '/*.json') as $file) {
                $id = basename($file, '.json');
                $urls[] = "https://analytix.finance/academy/{$type}/{$id}/";
            }
        }
        return response()->view('academy.sitemap', compact('urls'))
            ->header('Content-Type', 'application/xml');
    }
}
