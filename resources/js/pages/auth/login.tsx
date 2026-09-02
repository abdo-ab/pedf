import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Log in" />
            <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <a
                        href="/"
                        className="flex items-center gap-2 self-center font-medium"
                    >
                        <div className="flex size-8 items-center justify-center rounded-md bg-[#17221e] text-white">
                            <img
                                src="/favicon.svg"
                                className="size-8 fill-current text-white"
                            />
                        </div>
                        <span className="font-semibold text-gray-300">
                            Pedf.
                        </span>
                    </a>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">
                                Log in to your account
                            </CardTitle>
                            <CardDescription>
                                Enter your email and password below to log in
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {status && (
                                <div className="mb-4 text-center text-sm font-medium text-green-600">
                                    {status}
                                </div>
                            )}
                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                            >
                                {({ processing, errors }) => (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="name@gmail.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Password"
                                            />
                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">
                                                Remember me
                                            </Label>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing && <Spinner />}
                                            Log in
                                        </Button>

                                        <p className="text-center text-sm text-muted-foreground">
                                            Don't have an account?{' '}
                                            <TextLink
                                                href={register()}
                                                tabIndex={6}
                                            >
                                                Sign up
                                            </TextLink>
                                        </p>
                                    </div>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
