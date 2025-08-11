import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useRoutes } from "@/hooks/useRoutes";

export default function RoutesPage() {
  const { routes, loading } = useRoutes();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Routes</h1>
        <Link href='/admin/routes/new'>
          <Button>Create Route</Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          <Table className='min-w-full divide-y divide-gray-200'>
            <TableCaption>A list of your train routes.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Name
                </TableHead>
                <TableHead className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Train Number
                </TableHead>
                <TableHead className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </TableHead>
                <TableHead className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='bg-white divide-y divide-gray-200'>
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-4'>
                    No routes found.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className='px-6 py-4 whitespace-nowrap'>
                      {route.name}
                    </TableCell>
                    <TableCell className='px-6 py-4 whitespace-nowrap'>
                      {route.train_number}
                    </TableCell>
                    <TableCell className='px-6 py-4 whitespace-nowrap'>
                      {route.is_active ? "Active" : "Inactive"}
                    </TableCell>
                    <TableCell className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <Link href={`/admin/routes/${route.id}/edit`}>
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
