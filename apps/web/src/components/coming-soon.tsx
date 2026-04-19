import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@brif/ui';

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
          <CardDescription>
            Esta seção está prevista no roadmap e será liberada em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brif-muted">
            Enquanto isso, você pode acompanhar o briefing e o status de aprovação
            do projeto na aba principal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
