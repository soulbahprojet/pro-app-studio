import UserInvitePage from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        

export default function UserInvite() {
  return <UserInvitePage />;
}
